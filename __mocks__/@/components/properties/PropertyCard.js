// Mock PropertyCard component to simplify testing
module.exports = {
  __esModule: true,
  default: ({ property }) => ({
    type: 'div',
    props: {
      'data-testid': `property-card-${property.id}`,
      className: 'property-card',
      children: [
        {
          type: 'h3',
          props: {
            children: property.title
          }
        },
        {
          type: 'p',
          props: {
            'data-testid': 'property-price',
            children: `$${property.price.toLocaleString()}`
          }
        },
        {
          type: 'p',
          props: {
            'data-testid': 'property-address',
            children: property.address
          }
        },
        {
          type: 'p',
          props: {
            'data-testid': 'property-status',
            children: property.status
          }
        }
      ]
    }
  })
}
