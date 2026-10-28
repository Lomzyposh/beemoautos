import { useEffect, useState, useRef, createContext, useContext } from "react";
import {
  Routes,
  Route,
  Link,
  NavLink,
  useNavigate,
  useSearchParams,
  useParams,
  useLocation,
} from "react-router-dom";
import {
  Phone,
  MapPin,
  Menu,
  X,
  Search,
  MessageCircle,
  Check,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  Upload,
  ShieldCheck,
  CalendarDays,
} from "lucide-react";
import config from "./config/siteConfig";
import { inventoryService } from "./services/inventoryService";
import {
  whatsappUrl,
  carEnquiry,
  enquiryService,
} from "./services/enquiryService";
import { currencyService } from "./services/currencyService";

const Data = createContext();
const nav = [
  ["/", "Home"],
  ["/inventory", "Inventory"],
  ["/about", "About us"],
  ["/services", "Services"],
  ["/contact", "Contact"],
];
const carName = (c) => `${c.make} ${c.model}`;

/* ---------- shared pieces ---------- */
function WhatsApp({ message, children = "Chat on WhatsApp", className = "button" }) {
  return (
    <a className={className} href={whatsappUrl(message)} target="_blank" rel="noreferrer">
      <MessageCircle size={18} />
      {children}
    </a>
  );
}

function Brand() {
  return (
    <Link to="/" className="brand" aria-label={`${config.name} (${config.fullName})`}>
      {config.logo ? (
        <img src={config.logo} alt={config.name} />
      ) : (
        <>
          <span>
            {config.shortName}
            <span className="brand-mark">/</span>
          </span>
          <small>Autos</small>
        </>
      )}
    </Link>
  );
}

function Field({ label, children, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children || <input {...props} />}
    </label>
  );
}

function PageHead({ title, note }) {
  return (
    <header className="page-head">
      <h1>{title}</h1>
      {note && <p>{note}</p>}
    </header>
  );
}

/* ---------- layout: navbar + stage ---------- */
function Navbar() {
  const [open, setOpen] = useState(false);
  const { currency, setCurrency } = useContext(Data);
  const location = useLocation();
  useEffect(() => setOpen(false), [location]);
  return (
    <header className={`navbar ${open ? "open" : ""}`}>
      <div className="navbar-main">
        <Brand />
        <nav className="navbar-links" aria-label="Main navigation">
          {nav.map(([path, label]) => (
            <NavLink key={path} to={path} end={path === "/"}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="navbar-actions">
          {config.supportedCurrencies.length > 1 && (
            <label className="currency">
              <span>Currency</span>
              <select
                aria-label="Display currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                {config.supportedCurrencies.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
          )}
          <Link to="/sell-your-car" className="button">
            Sell your car
          </Link>
        </div>
        <button
          className="menu-button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="navbar-menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      <div className="navbar-menu" id="navbar-menu">
        <div className="navbar-mobile-links">
          <nav aria-label="Mobile navigation">
            {nav.map(([path, label]) => (
              <NavLink key={path} to={path} end={path === "/"}>
                {label}
              </NavLink>
            ))}
          </nav>
          <Link to="/sell-your-car" className="button">
            Sell your car
          </Link>
          {config.supportedCurrencies.length > 1 && (
            <label className="currency">
              <span>Currency</span>
              <select
                aria-label="Display currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                {config.supportedCurrencies.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
          )}
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer>
      <div className="footer-main">
        <div>
          <h4>{config.fullName}</h4>
          <p>{config.description}</p>
          <div className="socials">
            {Object.entries(config.socialLinks)
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <a href={v} target="_blank" rel="noreferrer" key={k}>
                  {k}
                </a>
              ))}
          </div>
        </div>
        <div>
          <h4>Explore</h4>
          {nav.slice(1).map(([p, l]) => (
            <Link key={p} to={p}>
              {l}
            </Link>
          ))}
        </div>
        <div>
          <h4>Talk to us</h4>
          <a href={`tel:${config.phone}`}>{config.phone}</a>
          {config.email && <a href={`mailto:${config.email}`}>{config.email}</a>}
          <span>{config.address}</span>
          <span>{config.hours}</span>
        </div>
        <div>
          <h4>Next step</h4>
          <Link to="/inventory">Find your car</Link>
          <Link to="/sell-your-car">Sell your car</Link>
          <WhatsApp className="text-link" message={`Hello ${config.name}, I'd like help finding a car.`} />
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} {config.name}
        </span>
        <span>{config.demo ? "Demo inventory. Sample prices and contact details." : config.tagline}</span>
      </div>
    </footer>
  );
}

/* ---------- vehicle card (used as tile on Home, as row on Inventory) ---------- */
function Card({ car }) {
  const { currency, rates } = useContext(Data);
  const to = `/inventory/${car.id}`;
  return (
    <article className="car-card">
      <Link className="car-image" to={to} aria-label={`View ${carName(car)}`}>
        <img src={car.images[0]} alt={carName(car)} loading="lazy" />
      </Link>
      <div className="car-info">
        <div>
          <h3>
            <Link to={to}>{carName(car)}</Link>
          </h3>
          <p>
            {car.year || "Year to be confirmed"} · {car.bodyStyle} · {car.color} · {car.condition}
          </p>
        </div>
        <div className="car-price">
          <strong>{currencyService.format(car.price, currency, rates)}</strong>
          <a
            href={carEnquiry(car)}
            aria-label={`Enquire about ${carName(car)}`}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={20} />
          </a>
        </div>
      </div>
    </article>
  );
}

function SearchBar() {
  const { cars } = useContext(Data);
  const navigate = useNavigate();
  const [make, setMake] = useState(""),
    [model, setModel] = useState(""),
    [budget, setBudget] = useState("");
  const makes = [...new Set(cars.map((c) => c.make))];
  return (
    <form
      className="search-bar"
      onSubmit={(e) => {
        e.preventDefault();
        navigate(`/inventory?${new URLSearchParams({ make, q: model, max: budget })}`);
      }}
    >
      <label>
        <span>Make</span>
        <select value={make} onChange={(e) => setMake(e.target.value)}>
          <option value="">All makes</option>
          {makes.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </label>
      <label>
        <span>Model</span>
        <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Any model" />
      </label>
      <label>
        <span>Budget</span>
        <select value={budget} onChange={(e) => setBudget(e.target.value)}>
          <option value="">Any price</option>
          <option value="50000000">Under ₦50 million</option>
          <option value="75000000">Under ₦75 million</option>
          <option value="150000000">Under ₦150 million</option>
        </select>
      </label>
      <button className="button" type="submit">
        <Search size={18} />
        Find a car
      </button>
    </form>
  );
}

function Sourcing({ query = "" }) {
  return (
    <section className="sourcing">
      <div>
        <h3>Don’t see what you’re looking for?</h3>
        <p>
          Tell us the car you have in mind and your budget. We’ll talk through the possibilities.
        </p>
      </div>
      <WhatsApp
        message={`Hello ${config.name}, I'm looking for a car${query ? `: ${query}` : ""}. My preferred year is __ and my budget is ₦__. Can you help me source it?`}
      >
        Request a car
      </WhatsApp>
    </section>
  );
}

/* ---------- pages ---------- */
function Home() {
  const { cars, currency, rates } = useContext(Data);
  const [category, setCategory] = useState("All");
  const hero = cars.find((c) => c.id === config.heroVehicleId);
  const featured = cars.filter((c) => c.featured);
  const categories = ["All", ...new Set(featured.map((c) => c.bodyStyle).filter(Boolean))];
  const shown = featured.filter((c) => category === "All" || c.bodyStyle === category);
  const makes = [...new Set(cars.map((c) => c.make))].map((m) => [
    m,
    cars.filter((c) => c.make === m).length,
  ]);
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <h1>
            Find your next <em>chapter.</em>
          </h1>
          <p>
            New and pre-owned vehicles in {config.city}. Tell us what you need and we’ll show you
            the cars that fit.
          </p>
          <SearchBar />
          <Link className="text-link" to="/inventory">
            Browse all {cars.length || ""} vehicles
          </Link>
        </div>
        <div className="hero-media">
          <img src={config.heroImage} alt={hero ? `${carName(hero)} from ${config.name}` : config.name} />
          {hero && (
            <Link className="hero-plate" to={`/inventory/${hero.id}`}>
              <span>{hero.id}</span>
              <strong>
                {hero.year} {carName(hero)}
              </strong>
              <small>{currencyService.format(hero.price, currency, rates)}</small>
            </Link>
          )}
        </div>
      </section>

      <section className="pad">
        <div className="section-title">
          <h2>On the lot now</h2>
          <Link to="/inventory" className="text-link">
            View all vehicles
          </Link>
        </div>
        <div className="chips" role="tablist" aria-label="Vehicle type">
          {categories.map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={category === c}
              className={category === c ? "active" : ""}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="scroller">
          {shown.map((c) => (
            <Card car={c} key={c.id} />
          ))}
        </div>
      </section>

      <section className="pad makes">
        <h2>Shop by make</h2>
        <div>
          {makes.map(([m, n]) => (
            <Link key={m} to={`/inventory?make=${encodeURIComponent(m)}`}>
              {m}
              <small>{n} in stock</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="pad story">
        <img src={config.aboutImage} alt="A vehicle in a contemporary showroom" loading="lazy" />
        <div>
          <h2>The right car. The right conversation.</h2>
          <p>
            A car is a big decision. Start with a team that listens to what you need, explains your
            options and gives you room to decide.
          </p>
          <div className="trust-line">
            <ShieldCheck />
            <div>
              <h4>See it before you decide</h4>
              <p>Arrange an inspection and ask the questions that matter.</p>
            </div>
          </div>
          <div className="trust-line">
            <MessageCircle />
            <div>
              <h4>A real conversation</h4>
              <p>Go straight to our team for vehicle details and next steps.</p>
            </div>
          </div>
          <Link to="/about" className="button dark">
            Get to know us
          </Link>
        </div>
      </section>

      <section className="pad twin">
        <Link to="/sell-your-car" className="sell-panel">
          <h2>Ready to pass the keys on?</h2>
          <p>We buy cars, too. Share your vehicle details and a few photos, and we’ll take it from there.</p>
          <span className="button">Sell your car</span>
        </Link>
        <Sourcing />
      </section>

      <section className="pad visit">
        <h2>Pictures are good. In person is better.</h2>
        <div>
          <span>
            <MapPin size={18} />
            {config.address}
          </span>
          <span>
            <CalendarDays size={18} />
            {config.hours}
          </span>
          <Link to="/contact" className="button dark">
            Plan your visit
          </Link>
        </div>
      </section>
    </>
  );
}

function Inventory() {
  const { cars, loading, error } = useContext(Data);
  const [params, setParams] = useSearchParams();
  const [sort, setSort] = useState("latest");
  const value = (k) => params.get(k) || "";
  const update = (k, v) => {
    const next = new URLSearchParams(params);
    v ? next.set(k, v) : next.delete(k);
    setParams(next, { replace: true });
  };
  const matches = cars.filter(
    (c) =>
      (!value("q") || carName(c).toLowerCase().includes(value("q").toLowerCase())) &&
      (!value("make") || c.make === value("make")) &&
      (!value("condition") || c.condition === value("condition")) &&
      (!value("year") || c.year === Number(value("year"))) &&
      (!value("max") || (Number.isFinite(c.price) && c.price > 0 && c.price <= Number(value("max")))),
  );
  matches.sort((a, b) =>
    sort === "low"
      ? (a.price ?? Infinity) - (b.price ?? Infinity)
      : sort === "high"
        ? (b.price ?? -Infinity) - (a.price ?? -Infinity)
        : b.year - a.year,
  );
  const uniq = (key) => [...new Set(cars.map((c) => c[key]).filter(Boolean))];
  return (
    <main className="pad inventory">
      <PageHead title="Inventory" note="New and pre-owned. Find the car that fits your world." />
      <div className="filterbar">
        <label className="grow">
          Make or model
          <div className="input-icon">
            <Search size={18} />
            <input
              value={value("q")}
              onChange={(e) => update("q", e.target.value)}
              placeholder="Search vehicles"
            />
          </div>
        </label>
        <label>
          Make
          <select value={value("make")} onChange={(e) => update("make", e.target.value)}>
            <option value="">All makes</option>
            {uniq("make").map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
        <label>
          Condition
          <select value={value("condition")} onChange={(e) => update("condition", e.target.value)}>
            <option value="">Any</option>
            {uniq("condition").map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Year
          <select value={value("year")} onChange={(e) => update("year", e.target.value)}>
            <option value="">Any</option>
            {uniq("year")
              .filter(Number.isFinite)
              .sort((a, b) => b - a)
              .map((y) => (
                <option key={y}>{y}</option>
              ))}
          </select>
        </label>
        <label>
          Max price (₦)
          <input
            type="number"
            min="0"
            step="1000000"
            placeholder="Any budget"
            value={value("max")}
            onChange={(e) => update("max", e.target.value)}
          />
        </label>
      </div>
      <div className="results-top">
        <span>
          {matches.length} vehicle{matches.length !== 1 ? "s" : ""}
          {params.toString() && (
            <button className="reset" onClick={() => setParams({})}>
              Clear filters
            </button>
          )}
        </span>
        <select aria-label="Sort vehicles" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="latest">Newest year</option>
          <option value="low">Price: low to high</option>
          <option value="high">Price: high to low</option>
        </select>
      </div>
      {loading ? (
        <p role="status">Loading vehicles…</p>
      ) : error ? (
        <p role="alert">We couldn’t load the vehicles. Refresh the page to try again.</p>
      ) : matches.length ? (
        <div className="lot">
          {matches.map((c) => (
            <Card key={c.id} car={c} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <Search size={36} />
          <h3>No vehicles match your filters.</h3>
          <p>Try a different make or a wider budget, or let us source the car for you.</p>
          <button className="button dark" onClick={() => setParams({})}>
            Reset search
          </button>
        </div>
      )}
      <Sourcing query={params.toString()} />
    </main>
  );
}

function Detail() {
  const { id } = useParams();
  const { cars, loading, currency, rates } = useContext(Data);
  const car = cars.find((c) => c.id === id);
  const [index, setIndex] = useState(0);
  useEffect(() => setIndex(0), [id]);
  if (loading) return <main className="pad">Loading vehicle…</main>;
  if (!car) return <NotFound />;
  const count = car.images.length;
  return (
    <main className="pad detail">
      <Link className="back-link" to="/inventory">
        <ChevronLeft size={17} />
        Back to inventory
      </Link>
      <div className="detail-grid">
        <div>
          <div className="gallery">
            <img src={car.images[index]} alt={`${carName(car)}, image ${index + 1}`} />
            {count > 1 && (
              <div className="gallery-controls">
                <button aria-label="Previous photo" onClick={() => setIndex((index - 1 + count) % count)}>
                  <ChevronLeft />
                </button>
                <span>
                  {index + 1} / {count}
                </span>
                <button aria-label="Next photo" onClick={() => setIndex((index + 1) % count)}>
                  <ChevronRight />
                </button>
              </div>
            )}
          </div>
          {count > 1 && (
            <div className="thumbs">
              {car.images.map((src, i) => (
                <button
                  key={src}
                  className={i === index ? "active" : ""}
                  aria-label={`Show photo ${i + 1}`}
                  onClick={() => setIndex(i)}
                >
                  <img src={src} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
          <div className="detail-description">
            <h3>A closer look</h3>
            <p>{car.description}</p>
            <h4>Features</h4>
            {!car.features.length && <p>Contact us to confirm the vehicle specifications.</p>}
            <ul className="feature-list">
              {car.features.map((f) => (
                <li key={f}>
                  <Check size={17} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <aside className="detail-summary">
          <p className="meta">
            {car.year || "Year to be confirmed"} · {car.condition}
          </p>
          <h1>{carName(car)}</h1>
          <strong className="detail-price">{currencyService.format(car.price, currency, rates)}</strong>
          {currency !== "NGN" && <p>Indicative conversion. Final price quoted in NGN.</p>}
          <dl>
            {[
              ["Year", car.year],
              ["Condition", car.condition],
              ["Body style", car.bodyStyle],
              ["Exterior", car.color],
              ["Stock reference", car.id],
            ].map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v ?? "To be confirmed"}</dd>
              </div>
            ))}
          </dl>
          <a className="button" href={carEnquiry(car)} target="_blank" rel="noreferrer">
            <MessageCircle size={18} />
            Enquire on WhatsApp
          </a>
          <Link
            className="button outline"
            to={`/contact?car=${encodeURIComponent(car.year + " " + car.make + " " + car.model)}`}
          >
            Arrange an inspection
          </Link>
          <p className="fine">
            {config.demo
              ? "Sample listing and price for demonstration."
              : "Contact our team to confirm current availability."}
          </p>
        </aside>
      </div>
    </main>
  );
}

function About() {
  return (
    <main>
      <section className="pad about-intro">
        <h1>A better car buying experience starts with you.</h1>
        <div className="about-columns">
          <p>
            Whether you’re choosing your first car, upgrading for family life or searching for
            something special, your next vehicle should suit the way you live.
          </p>
          <p>
            At {config.name} ({config.fullName}), we help you explore new and pre-owned vehicles,
            arrange a closer look and move forward with the information you need.
          </p>
        </div>
      </section>
      <img className="about-wide" src={config.aboutImage} alt="A vehicle presented in a spacious showroom" />
      <section className="pad">
        <div className="section-title">
          <h2>Good cars. Clear conversations.</h2>
        </div>
        <ol className="principles">
          {[
            ["We listen first.", "Tell us what matters: your budget, your needs and the cars you love."],
            ["You take a closer look.", "Get vehicle details, arrange an inspection and ask your questions."],
            ["We help with the next step.", "Buying, selling or sourcing: speak directly with our team."],
          ].map(([t, p]) => (
            <li key={t}>
              <h3>{t}</h3>
              <p>{p}</p>
            </li>
          ))}
        </ol>
        <Link to="/contact" className="button dark">
          Meet your next car
        </Link>
      </section>
    </main>
  );
}

const services = [
  ["Buy a car", "Browse new and pre-owned vehicles, compare your options and ask our team for details.", "Explore inventory", "/inventory"],
  ["Sell your car", "Share your vehicle details and photos. We’ll discuss its condition and the next steps with you.", "Start your submission", "/sell-your-car"],
  ["Find something specific", "Have a particular make or model in mind? Tell us what you’re looking for and your budget.", "Talk to our team", "whatsapp"],
  ["Take a closer look", "Arrange a visit to see the vehicle, check the details and decide in your own time.", "Book an inspection", "/contact"],
];

function Services() {
  const [open, setOpen] = useState(0);
  return (
    <main className="pad">
      <PageHead title="Your next move, made simpler." note="Buying, selling or still looking. Start here." />
      <div className="services-list">
        {services.map(([t, p, cta, url], i) => (
          <article key={t} className={open === i ? "expanded" : ""}>
            <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
              <h2>{t}</h2>
              {open === i ? <Minus /> : <Plus />}
            </button>
            {open === i && (
              <div className="service-body">
                <p>{p}</p>
                {url === "whatsapp" ? (
                  <WhatsApp message={`Hello ${config.name}, I'd like help sourcing a vehicle.`}>{cta}</WhatsApp>
                ) : (
                  <Link className="button dark" to={url}>
                    {cta}
                  </Link>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}

function Contact() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const result = await enquiryService.submit(Object.fromEntries(new FormData(e.currentTarget)));
      setStatus(result.message);
    } catch {
      setStatus("Unable to process your enquiry. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  const car = params.get("car");
  return (
    <main className="pad">
      <PageHead title="It starts with a conversation." />
      <div className="contact-grid">
        <div className="contact-info">
          <h3>Visit, call or say hello</h3>
          <a href={`tel:${config.phone}`}>
            <Phone />
            {config.phone}
          </a>
          {config.email && <a href={`mailto:${config.email}`}>{config.email}</a>}
          <p>
            <MapPin size={19} />
            {config.address}
          </p>
          <p>
            <CalendarDays size={19} />
            {config.hours}
          </p>
          <WhatsApp message={`Hello ${config.name}, I'd like to enquire about a vehicle.`} />
          <a
            className="text-link"
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.address)}`}
            target="_blank"
            rel="noreferrer"
          >
            Open directions
          </a>
        </div>
        <form className="form-panel" onSubmit={submit}>
          <h3>{car ? "Arrange an inspection" : "What can we help with?"}</h3>
          <p>Share your details and your preferred next step.</p>
          <div className="form-grid">
            <Field label="Full name *" name="name" required autoComplete="name" />
            <Field label="Phone number *" name="phone" type="tel" required autoComplete="tel" />
            <Field label="Email *" name="email" type="email" required autoComplete="email" />
            <Field label="I’m interested in">
              <select name="interest" defaultValue={car ? "Inspection" : "Buying a car"}>
                {["Buying a car", "Inspection", "Selling a car", "Sourcing a car"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Your message *">
            <textarea
              name="message"
              rows="4"
              required
              defaultValue={car ? `I'd like to inspect the ${car}. My preferred date is ` : ""}
            />
          </Field>
          <p className="fine">Demo form: details are not sent or stored. Use WhatsApp for the enquiry flow.</p>
          <button disabled={busy} className="button dark">
            {busy ? "Preparing…" : "Preview enquiry"}
          </button>
          {status && (
            <p className="form-status" role="status">
              <Check size={18} />
              {status}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}

function Sell() {
  const [files, setFiles] = useState([]),
    [error, setError] = useState(""),
    [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false);
  const previewUrls = useRef([]);
  useEffect(() => () => previewUrls.current.forEach((url) => URL.revokeObjectURL(url)), []);
  function choose(e) {
    const list = Array.from(e.target.files);
    if (
      list.length > 6 ||
      list.some(
        (f) => !["image/jpeg", "image/png", "image/webp"].includes(f.type) || f.size > 5 * 1024 * 1024,
      )
    ) {
      setError("Choose up to 6 JPG, PNG or WebP photos, each under 5 MB.");
      return;
    }
    setError("");
    setFiles(
      list.map((file) => {
        const url = URL.createObjectURL(file);
        previewUrls.current.push(url);
        return { file, url };
      }),
    );
  }
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const result = await enquiryService.submit({
        ...Object.fromEntries(new FormData(e.currentTarget)),
        photos: files.map((f) => f.file),
      });
      setStatus(result.message);
    } catch {
      setStatus("Unable to prepare the submission. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="pad">
      <PageHead title="Your car’s next chapter." note="Tell us about yourself and your car. Let’s start with the details." />
      <form className="sell-form form-panel" onSubmit={submit}>
        <div className="form-heading">
          <span>1</span>
          <h3>About you</h3>
        </div>
        <div className="form-grid">
          <Field label="Full name *" name="name" required autoComplete="name" />
          <Field label="Phone number *" name="phone" type="tel" required autoComplete="tel" />
          <Field label="Email *" name="email" type="email" required autoComplete="email" />
          <Field label="Location *" name="location" required placeholder="City / state" />
        </div>
        <div className="form-heading">
          <span>2</span>
          <h3>Your car</h3>
        </div>
        <div className="form-grid">
          <Field label="Make *" name="make" required placeholder="e.g. Toyota" />
          <Field label="Model *" name="model" required placeholder="e.g. Camry" />
          <Field label="Year *" name="year" required type="number" min="1900" max={new Date().getFullYear() + 1} />
          <Field label="Condition *">
            <select name="condition" required>
              <option value="">Select condition</option>
              <option>Brand new</option>
              <option>Used</option>
            </select>
          </Field>
          <Field label="Asking price (₦) *" name="price" type="number" min="1" required />
          <Field label="Exterior colour" name="color" />
        </div>
        <Field label="Tell us more">
          <textarea
            rows="4"
            name="description"
            placeholder="Ownership history, documents available, features and any known issues."
          />
        </Field>
        <div className="form-heading">
          <span>3</span>
          <h3>Photos</h3>
        </div>
        <label className="upload-zone">
          <Upload />
          <strong>Add photos of your car</strong>
          <span>Up to 6 photos · JPG, PNG, WebP · 5 MB each</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={choose} />
        </label>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <div className="photo-previews">
          {files.map((f, i) => (
            <div key={f.url}>
              <img src={f.url} alt={`Vehicle upload preview ${i + 1}`} />
              <button
                type="button"
                aria-label={`Remove photo ${i + 1}`}
                onClick={() => setFiles(files.filter((_, n) => n !== i))}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        <label className="consent">
          <input type="checkbox" required />I confirm these details are accurate and agree to be contacted
          about this vehicle.
        </label>
        <p className="fine">
          Demo preview: your details and photos remain in this page and are not uploaded or sent.
        </p>
        <button className="button dark" disabled={busy}>
          {busy ? "Preparing…" : "Preview submission"}
        </button>
        {status && (
          <p role="status" className="form-status">
            <Check size={18} />
            {status}
          </p>
        )}
      </form>
    </main>
  );
}

function NotFound() {
  return (
    <main className="pad empty">
      <h1>A different road.</h1>
      <p>We couldn’t find that page or vehicle.</p>
      <Link className="button dark" to="/inventory">
        Back to inventory
      </Link>
    </main>
  );
}

export default function App() {
  const [cars, setCars] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(false),
    [currency, setCurrency] = useState("NGN"),
    [rates, setRates] = useState({ NGN: 1 });
  const location = useLocation();
  useEffect(() => {
    inventoryService
      .list()
      .then(setCars)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
    currencyService
      .rates()
      .then(setRates)
      .catch(() => setCurrency("NGN"));
    for (const [key, value] of Object.entries(config.colors))
      document.documentElement.style.setProperty(`--${key}`, value);
    document.title = `${config.name} | ${config.tagline}`;
  }, []);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);
  return (
    <Data.Provider value={{ cars, loading, error, currency, setCurrency, rates }}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="app">
        <Navbar />
        <div className="stage">
          <div id="main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/inventory/:id" element={<Detail />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/sell-your-car" element={<Sell />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </div>
    </Data.Provider>
  );
}