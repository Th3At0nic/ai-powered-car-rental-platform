import mongoose from 'mongoose';
import config from '../config';
import { VehicleModel } from '../module/vehicle/vehicle.model';

const vehicles = [
  {
    name: 'Camry Hybrid',
    brand: 'Toyota',
    category: 'sedan',
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb',
    pricePerDay: 65,
    seats: 5,
    transmission: 'automatic',
    fuelType: 'hybrid',
    location: 'Dhaka',
    rating: 4.9,
    isAvailable: true,
    description:
      'Comfortable 5-seater hybrid sedan ideal for long city rides and highway travel with excellent fuel efficiency.',
    features: [
      'Leather Seats',
      'Adaptive Cruise Control',
      'Apple CarPlay & Android Auto',
      '360 Camera',
      'Dual-Zone Climate Control',
    ],
  },
  {
    name: 'RAV4',
    brand: 'Toyota',
    category: 'suv',
    image: 'https://images.unsplash.com/photo-1568844293986-8c6b4e7f5a6b',
    pricePerDay: 78,
    seats: 5,
    transmission: 'automatic',
    fuelType: 'hybrid',
    location: 'Dhaka',
    rating: 4.8,
    isAvailable: true,
    description:
      'Spacious and reliable SUV offering a smooth ride, excellent fuel economy, and plenty of room for passengers.',
    features: [
      'All-Wheel Drive',
      'Apple CarPlay',
      'Lane Departure Alert',
      'Backup Camera',
      'Cruise Control',
    ],
  },
  {
    name: 'Civic Touring',
    brand: 'Honda',
    category: 'sedan',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6',
    pricePerDay: 58,
    seats: 5,
    transmission: 'automatic',
    fuelType: 'petrol',
    location: 'Chattogram',
    rating: 4.7,
    isAvailable: true,
    description:
      'Modern and sporty sedan with a refined interior, responsive handling, and excellent everyday practicality.',
    features: [
      'Sunroof',
      'Honda Sensing',
      'Apple CarPlay',
      'Rear Camera',
      'Push Start',
    ],
  },
  {
    name: 'CR-V',
    brand: 'Honda',
    category: 'suv',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6',
    pricePerDay: 82,
    seats: 5,
    transmission: 'automatic',
    fuelType: 'petrol',
    location: 'Dhaka',
    rating: 4.8,
    isAvailable: true,
    description:
      'Family-friendly SUV with generous cargo space, comfortable seating, and a smooth driving experience.',
    features: [
      'Panoramic Sunroof',
      'Adaptive Cruise Control',
      'Lane Assist',
      'Apple CarPlay',
      'Parking Sensors',
    ],
  },
  {
    name: 'Model 3',
    brand: 'Tesla',
    category: 'sedan',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89',
    pricePerDay: 95,
    seats: 5,
    transmission: 'automatic',
    fuelType: 'electric',
    location: 'Dhaka',
    rating: 4.9,
    isAvailable: true,
    description:
      'Premium electric sedan with impressive acceleration, advanced technology, and a minimalist interior.',
    features: [
      'Autopilot',
      'Glass Roof',
      'Premium Audio',
      'Touchscreen Display',
      'Fast Charging',
    ],
  },
  {
    name: 'Model Y',
    brand: 'Tesla',
    category: 'suv',
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399',
    pricePerDay: 110,
    seats: 5,
    transmission: 'automatic',
    fuelType: 'electric',
    location: 'Dhaka',
    rating: 4.9,
    isAvailable: true,
    description:
      'Premium electric SUV combining long-range driving, flexible cargo space, and advanced driver assistance.',
    features: [
      'Autopilot',
      'Panoramic Glass Roof',
      'Large Cargo Space',
      'Fast Charging',
      'Premium Interior',
    ],
  },
  {
    name: '3 Series',
    brand: 'BMW',
    category: 'luxury',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e',
    pricePerDay: 125,
    seats: 5,
    transmission: 'automatic',
    fuelType: 'petrol',
    location: 'Dhaka',
    rating: 4.9,
    isAvailable: true,
    description:
      'Luxury sports sedan delivering a refined interior, dynamic handling, and an engaging driving experience.',
    features: [
      'Leather Interior',
      'Digital Cockpit',
      'Sunroof',
      'Parking Assistant',
      'Premium Sound',
    ],
  },
  {
    name: 'X5',
    brand: 'BMW',
    category: 'luxury',
    image: 'https://images.unsplash.com/photo-1556189250-72ba954cfc2b',
    pricePerDay: 160,
    seats: 5,
    transmission: 'automatic',
    fuelType: 'petrol',
    location: 'Dhaka',
    rating: 4.8,
    isAvailable: true,
    description:
      'Premium luxury SUV offering powerful performance, sophisticated technology, and exceptional passenger comfort.',
    features: [
      'Premium Leather',
      'Panoramic Roof',
      'Adaptive Suspension',
      'Harman Kardon Audio',
      'Parking Assistant',
    ],
  },
  {
    name: 'C-Class',
    brand: 'Mercedes-Benz',
    category: 'luxury',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8',
    pricePerDay: 145,
    seats: 5,
    transmission: 'automatic',
    fuelType: 'petrol',
    location: 'Gulshan, Dhaka',
    rating: 4.9,
    isAvailable: true,
    description:
      'Elegant luxury sedan combining premium comfort, modern technology, and smooth performance.',
    features: [
      'Ambient Lighting',
      'Leather Seats',
      'Digital Cockpit',
      'Burmester Audio',
      'Panoramic Sunroof',
    ],
  },
  {
    name: 'GLC',
    brand: 'Mercedes-Benz',
    category: 'luxury',
    image: 'https://images.unsplash.com/photo-1618843479618-39e9b0b0a4e6',
    pricePerDay: 155,
    seats: 5,
    transmission: 'automatic',
    fuelType: 'hybrid',
    location: 'Gulshan, Dhaka',
    rating: 4.8,
    isAvailable: true,
    description:
      'Luxury SUV with a comfortable cabin, refined performance, and advanced technology for city and highway travel.',
    features: [
      'Panoramic Sunroof',
      'Ambient Lighting',
      'Adaptive Cruise Control',
      'Premium Audio',
      '360 Camera',
    ],
  },
  {
    name: 'Tucson',
    brand: 'Hyundai',
    category: 'suv',
    image: 'https://images.unsplash.com/photo-1625231334168-35067f8853e1',
    pricePerDay: 72,
    seats: 5,
    transmission: 'automatic',
    fuelType: 'petrol',
    location: 'Sylhet',
    rating: 4.6,
    isAvailable: true,
    description:
      'Practical modern SUV with comfortable seating, useful technology, and plenty of space for family trips.',
    features: [
      'Wireless CarPlay',
      'Rear Camera',
      'Cruise Control',
      'Lane Assist',
      'Smart Key',
    ],
  },
  {
    name: 'Sportage',
    brand: 'Kia',
    category: 'suv',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6',
    pricePerDay: 70,
    seats: 5,
    transmission: 'automatic',
    fuelType: 'hybrid',
    location: 'Chattogram',
    rating: 4.7,
    isAvailable: true,
    description:
      'Stylish and efficient crossover SUV designed for comfortable city driving and weekend adventures.',
    features: [
      'Hybrid Engine',
      'Apple CarPlay',
      'Lane Keep Assist',
      'Rear Camera',
      'Cruise Control',
    ],
  },
  {
    name: 'Mustang GT',
    brand: 'Ford',
    category: 'coupe',
    image: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd',
    pricePerDay: 135,
    seats: 4,
    transmission: 'automatic',
    fuelType: 'petrol',
    location: 'Dhaka',
    rating: 4.8,
    isAvailable: true,
    description:
      'Iconic performance coupe with powerful acceleration, distinctive styling, and an exciting driving experience.',
    features: [
      'V8 Engine',
      'Sport Mode',
      'Premium Audio',
      'Leather Seats',
      'Performance Brakes',
    ],
  },
  {
    name: 'Hiace',
    brand: 'Toyota',
    category: 'van',
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7b',
    pricePerDay: 90,
    seats: 12,
    transmission: 'manual',
    fuelType: 'diesel',
    location: 'Dhaka',
    rating: 4.5,
    isAvailable: true,
    description:
      'Reliable passenger van with generous seating capacity, making it ideal for families, groups, and corporate travel.',
    features: [
      '12 Seats',
      'Large Luggage Space',
      'Air Conditioning',
      'Rear Camera',
      'USB Charging',
    ],
  },
  {
    name: 'Prius',
    brand: 'Toyota',
    category: 'hatchback',
    image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c',
    pricePerDay: 55,
    seats: 5,
    transmission: 'automatic',
    fuelType: 'hybrid',
    location: 'Rajshahi',
    rating: 4.6,
    isAvailable: false,
    description:
      'Fuel-efficient hybrid hatchback offering comfortable urban transportation with excellent economy.',
    features: [
      'Hybrid Engine',
      'Eco Mode',
      'Backup Camera',
      'Cruise Control',
      'Keyless Entry',
    ],
  },
];

const seedVehicles = async () => {
  try {
    await mongoose.connect(config.database_url as string);

    await VehicleModel.deleteMany({});

    await VehicleModel.insertMany(vehicles);

    console.log('Vehicle seed completed successfully');
    console.log(`${vehicles.length} vehicles inserted`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Vehicle seed failed:', error);

    await mongoose.disconnect();
    process.exit(1);
  }
};

seedVehicles();
