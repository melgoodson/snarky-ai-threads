import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import melFounder from "@/assets/mel-founder.png";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <section className="py-16 md:py-24">
          <div className="container px-4 max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
                THE SNARKY A$$ HUMANS <span className="text-primary">ORIGIN STORY</span>
              </h1>
              <p className="text-xl text-muted-foreground font-medium">
                How a Veteran, a Near Miss, and a Badass Sense of Humor Built a Brand
              </p>
            </div>

            <article className="space-y-8 text-lg">
              <div className="mb-12 overflow-hidden rounded-lg shadow-lg max-w-2xl mx-auto">
                <img
                  src={melFounder}
                  alt="Mel, founder of Snarky Humans, relaxing at home with his pets and Snarky Humans products"
                  className="w-full block"
                  style={{ marginBottom: '-80px' }}
                />
              </div>

              <p className="text-xl font-bold">
                Mel didn't plan to start a brand. He planned to make it home.
              </p>

              <p className="leading-relaxed">
                He served overseas. There was a blast. There was a man who needed saving. Mel moved, acted, and did what he was trained to do. The man lived. Mel lived too, but he didn't come back the same. Call it a service-related brain injury. Call it a mind rewired by impact and adrenaline. What it felt like was static in the head and a pressure cooker in the chest.
              </p>

              <p className="leading-relaxed">
                So he did what stubborn people do. He turned pain into a punchline and started writing the kind of jokes that make people snort-laugh in quiet rooms. Humor became a survival skill. Snark became a language. And the name wrote itself.
              </p>

              <p className="text-2xl font-black text-primary my-8">
                Snarky A$$ Humans was born.
              </p>

              <p className="leading-relaxed">
                This brand isn't an accident. It is a little bit therapy, a little bit middle finger, and a lot of community. Veterans get it. First responders get it. Anyone who's walked through fire and still shows up with a grin gets it. If you believe in supporting veterans, you can do it the laid-back way. Put it on your chest. Put it on your desk. Make the room smell like victory and vanilla.
              </p>

              <div className="my-12 border-l-4 border-primary pl-6 py-4 bg-muted/50">
                <h2 className="text-2xl font-black mb-4">Shop the goods that started it</h2>
                <ul className="space-y-3">
                  <li>
                    <strong>T-shirts and hoodies</strong> with unapologetic energy
                  </li>
                  <li>
                    <strong>Mugs</strong> built for brutal honesty before coffee kicks in
                  </li>
                </ul>
                <p className="mt-4 text-base italic">
                  Yes, they're "funny ass" on purpose. Yes, you can absolutely wear them to brunch. If your aunt clutches pearls, you're doing it right.
                </p>
              </div>

              <h2 className="text-3xl font-black mt-16 mb-6">
                The <span className="text-primary">Snarky Pets</span> Chapter
              </h2>
              <p className="text-xl font-semibold mb-4">
                Because the animals are part of the chaos and the cure
              </p>

              <p className="leading-relaxed">
                Some days the brain buzzes. Some days the dog won't sit still. Some days the cat leads a small but organized uprising against the sofa. Mel noticed something simple. When the animals were busy and fed well, everyone's shoulders dropped an inch.
              </p>

              <p className="leading-relaxed">
                So Snarky Pets joined the family. Healthy freeze-dried treats. Enrichment toys that redirect gremlin energy. Scratchers that stop your cat from performing drywall renovations at two in the morning. It is calm by way of clever.
              </p>

              <div className="my-12 border-l-4 border-primary pl-6 py-4 bg-muted/50">
                <h3 className="text-xl font-black mb-4">Start the peace plan here</h3>
                <ul className="space-y-3">
                  <li>Freeze-dried treats for training without the junk</li>
                  <li>Cat tunnels, cubes, and scratch pads that save couches</li>
                  <li>Full Snarky Pets lineup for dogs and cats</li>
                </ul>
              </div>

              <h2 className="text-3xl font-black mt-16 mb-6">
                Why Snarky <span className="text-primary">Works</span>
              </h2>

              <p className="leading-relaxed">
                Snarky A$$ Humans is a veteran-owned label that supports veteran life by keeping it real. If you want to support veterans, start by supporting the people building things after the dust settles. Wear the shirt. Sip from the mug that says exactly what you mean. Give the dog a better treat and the cat a better target than your ottoman. It is small habit after small habit until a hard day feels a little lighter.
              </p>

              <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link to="/">Shop Now</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/collections">Browse Collections</Link>
                </Button>
              </div>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
