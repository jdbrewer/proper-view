import { PrismaClient } from '@prisma/client'
import fetch from 'node-fetch'

const prisma = new PrismaClient()

const PEXELS_API_KEY = 'wd6Onge8SPgZZAg90e9iJO5LS3BbZ8fO62pum61HiArgLt3DX3KIPKeW';
const FALLBACK_IMAGE = 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&w=800&q=80';
const MAPBOX_TOKEN = 'pk.eyJ1Ijoibm90ZWJyZXdlciIsImEiOiJjazV5YmdvMGMyZmJ3M2puNXN1bm83MDV2In0.VyL84aFSi0Nx5wr4UvqlfQ';

// Fetch a batch of house images from Pexels Search API
async function fetchHouseImages() {
  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=house&orientation=landscape&per_page=30`,
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      }
    );
    const data = await response.json();
    console.log('Pexels API raw response:', data);
    if (data.photos && data.photos.length > 0) {
      // Log the URLs for debugging
      console.log('Fetched Pexels images:', data.photos.map(img => img.src.landscape));
      return data.photos.map(img => img.src.landscape);
    }
    return [FALLBACK_IMAGE];
  } catch (err) {
    console.error('Error fetching Pexels images:', err);
    return [FALLBACK_IMAGE];
  }
}

// Geocode an address using Mapbox Geocoding API
async function geocodeAddress(address) {
  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${MAPBOX_TOKEN}`
    );
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const [longitude, latitude] = data.features[0].center;
      const context = data.features[0].context || [];
      
      // Extract city, state, and zip from context
      const city = context.find(c => c.id.startsWith('place'))?.text;
      const state = context.find(c => c.id.startsWith('region'))?.text;
      const zipCode = context.find(c => c.id.startsWith('postcode'))?.text;
      
      return { latitude, longitude, city, state, zipCode };
    }
    return null;
  } catch (err) {
    console.error('Error geocoding address:', err);
    return null;
  }
}

const cities = [
  { city: 'Portland', state: 'OR', zip: '97201' },
  { city: 'Seattle', state: 'WA', zip: '98101' },
  { city: 'San Francisco', state: 'CA', zip: '94102' },
  { city: 'Denver', state: 'CO', zip: '80202' },
  { city: 'Austin', state: 'TX', zip: '78701' },
  { city: 'Chicago', state: 'IL', zip: '60601' },
  { city: 'Boston', state: 'MA', zip: '02108' },
  { city: 'Miami', state: 'FL', zip: '33101' },
  { city: 'New York', state: 'NY', zip: '10001' },
  { city: 'Los Angeles', state: 'CA', zip: '90001' },
]

const streetNames = [
  'Maple Ave', 'Oak St', 'Pine Rd', 'Cedar Ln', 'Elm St',
  'Sunset Blvd', 'Broadway', 'Main St', 'Park Ave', 'Lakeview Dr'
]

const statuses = ['active', 'pending', 'sold']

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

async function main() {
  // Clear existing data in the correct order
  await prisma.inquiry.deleteMany();
  await prisma.property.deleteMany();
  await prisma.agent.deleteMany();

  // Create 3 agents
  const agents = await Promise.all([
    prisma.agent.create({ data: { name: 'John Doe', email: 'john.doe@example.com' } }),
    prisma.agent.create({ data: { name: 'Jane Smith', email: 'jane.smith@example.com' } }),
    prisma.agent.create({ data: { name: 'Alex Johnson', email: 'alex.johnson@example.com' } }),
  ])

  // Fetch a batch of house images
  const houseImages = await fetchHouseImages();

  // Create properties with specific status distribution
  const propertyCounts = {
    active: 12,
    pending: 3,
    sold: 3
  };

  let propertyIndex = 0;

  // Create properties for each status
  for (const [status, count] of Object.entries(propertyCounts)) {
    for (let i = 0; i < count; i++) {
      const cityObj = randomFrom(cities)
      const streetNum = randomInt(100, 9999)
      const street = randomFrom(streetNames)
      const address = `${streetNum} ${street}, ${cityObj.city}, ${cityObj.state} ${cityObj.zip}`
      const price = randomInt(250000, 1200000)
      const bedrooms = randomInt(1, 6)
      const bathrooms = randomInt(1, 4)
      const agent = randomFrom(agents)
      const image = houseImages[Math.floor(Math.random() * houseImages.length)];

      // Geocode the address
      const location = await geocodeAddress(address);
      
      await prisma.property.create({
        data: {
          title: `Beautiful Home #${propertyIndex + 1}`,
          description: `A wonderful property located in ${cityObj.city}, ${cityObj.state}.`,
          price,
          address,
          bedrooms,
          bathrooms,
          status,
          agentId: agent.id,
          image,
          // Add location data
          latitude: location?.latitude || null,
          longitude: location?.longitude || null,
          city: location?.city || cityObj.city,
          state: location?.state || cityObj.state,
          zipCode: location?.zipCode || cityObj.zip,
        },
      })
      propertyIndex++;
    }
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 