import { prisma } from '@/lib/prisma';
import Hero from '@/components/ui/Hero';
import FeaturedPropertiesCarousel from '@/components/properties/FeaturedPropertiesCarousel';

export default async function HomePage() {
  // Fetch only active properties
  const properties = await prisma.property.findMany({ where: { status: 'active' } });
  // Featured by price (low to high)
  const featuredByPrice = [...properties].sort((a, b) => a.price - b.price).slice(0, 5);
  // Featured by bedrooms (high to low)
  const featuredByBedrooms = [...properties].sort((a, b) => b.bedrooms - a.bedrooms).slice(0, 5);

  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Carousel 1: Selling Soon Homes */}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Popular Listings</h2>
        <p className="text-gray-600 mb-0">Likely to sell in the next month based on price, listing date, and property details.</p>
        <FeaturedPropertiesCarousel properties={featuredByPrice} />
        {/* Carousel 2: Most Bedrooms */}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-12">Homes with the Most Bedrooms</h2>
        <p className="text-gray-600 mb-0">Spacious homes for large families or those who love extra room.</p>
        <FeaturedPropertiesCarousel properties={featuredByBedrooms} />
      </div>
    </main>
  );
} 