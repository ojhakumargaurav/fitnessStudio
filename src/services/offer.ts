
/**
 * Represents an offer.
 */
export interface Offer {
  /**
   * The unique identifier of the offer.
   */
  id: string;
  /**
   * The name of the offer.
   */
  name: string;
  /**
   * The description of the offer.
   */
  description: string;
  /**
   * The discount percentage of the offer.
   */
  discountPercentage: number;
}

/**
 * Asynchronously retrieves a list of all available offers.
 *
 * @returns A promise that resolves to an array of Offer objects.
 */
export async function getOffers(): Promise<Offer[]> {
  // TODO: Implement this by calling an API.

  return [
    {
      id: '1',
      name: 'Summer Sale',
      description: 'Get 20% off on all classes',
      discountPercentage: 20,
    },
    {
      id: '2',
      name: 'New Member Discount',
      description: 'Get 10% off on your first membership',
      discountPercentage: 10,
    },
  ];
}
