import { ProductCard } from "./ProductCard";

const SAMPLE_PRODUCTS = [
  {
    id: 1,
    title: "You're Fired",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=800&fit=crop",
    category: "ATTITUDE"
  },
  {
    id: 2,
    title: "Free Hugs",
    price: 22.99,
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=800&fit=crop",
    category: "SARCASM"
  },
  {
    id: 3,
    title: "Alien Abductor",
    price: 26.99,
    image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=800&fit=crop",
    category: "ALIENS"
  },
  {
    id: 4,
    title: "Emergency Warranty",
    price: 23.99,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop",
    category: "HUMOR"
  },
  {
    id: 5,
    title: "Orgy Starter Kit",
    price: 27.99,
    image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=800&fit=crop",
    category: "ADULTS"
  },
  {
    id: 6,
    title: "Slavery Gets Done",
    price: 25.99,
    image: "https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=800&h=800&fit=crop",
    category: "DARK"
  },
  {
    id: 7,
    title: "Not Haitian",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&h=800&fit=crop",
    category: "POLITICAL"
  },
  {
    id: 8,
    title: "Bird Flu Survivor",
    price: 23.99,
    image: "https://images.unsplash.com/photo-1614160242806-9ce55f3f5bba?w=800&h=800&fit=crop",
    category: "HEALTH"
  }
];

export const ProductGrid = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
            FEATURED <span className="text-primary">DESIGNS</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Our most popular snarky shirts. Because normal is boring.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SAMPLE_PRODUCTS.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
};
