import { ProductCard } from "./ProductCard";
import rbfChampion from "@/assets/rbf-champion.png";
import snarkyHumans from "@/assets/snarky-humans.png";

const SAMPLE_PRODUCTS = [
  {
    id: "rbf-champion",
    title: "RBF Champion (I'm coming for you bitch)",
    price: 21.36,
    image: rbfChampion,
    category: "ATTITUDE"
  },
  {
    id: "free-hugs",
    title: "Free Hugs",
    price: 22.99,
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=800&fit=crop",
    category: "SARCASM"
  },
  {
    id: "alien-abductor",
    title: "Alien Abductor",
    price: 26.99,
    image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=800&fit=crop",
    category: "ALIENS"
  },
  {
    id: "emergency-warranty",
    title: "Emergency Warranty",
    price: 23.99,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop",
    category: "HUMOR"
  },
  {
    id: "orgy-starter-kit",
    title: "Orgy Starter Kit",
    price: 27.99,
    image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=800&fit=crop",
    category: "ADULTS"
  },
  {
    id: "slavery-gets-done",
    title: "Slavery Gets Done",
    price: 25.99,
    image: "https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=800&h=800&fit=crop",
    category: "DARK"
  },
  {
    id: "snarky-humans",
    title: "Snarky Humans Laughing Design",
    price: 20.69,
    image: snarkyHumans,
    category: "SNARKY HUMANS"
  },
  {
    id: "bird-flu-survivor",
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
            <ProductCard key={product.id} id={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
};
