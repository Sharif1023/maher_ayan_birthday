import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, CakeSlice, Camera, Check, ChevronDown, Heart, Image as ImageIcon, LockKeyhole, Menu, Music2, Pause, Play, Send, Sparkles, Star, Video, X } from 'lucide-react';
import SectionTitle from '../components/SectionTitle';
import MediaPlaceholder, { MediaImage } from '../components/MediaPlaceholder';
import { api, jsonBody } from '../lib/api';
import type { BootstrapData, BirthdayContent, MediaItem, MemoryItem, TimelineItem, Wish } from '../types';

const fallbackContent: BirthdayContent = {
  heroTitle: 'One Whole Year of Love', babyName: 'Maher Ayan', heroSubtitle: 'Our Little Sunshine Turns ONE!',
  heroDescription: '365 days of smiles, cuddles, laughter, and countless beautiful memories.',
  storyTitle: 'Our Beautiful Journey Begins',
  storyText: 'A year of little discoveries, gentle cuddles, bright smiles, and moments we will treasure forever. Add your own story and photographs from the admin dashboard.',
  birthdayLetter: 'Dear Maher Ayan,\n\nOne year ago, you came into our lives and made everything more beautiful.\n\nYour little smile brings happiness, your laughter fills our hearts, and every moment with you becomes a precious memory.\n\nWatching you grow has been the most beautiful journey.\n\nMay your life always be filled with happiness, love, laughter, good health, and endless adventures.\n\nNo matter how big you grow, you will always be our little sunshine.\n\nHappy 1st Birthday, Maher Ayan!\n\nWith endless love.',
  footerMessage: 'Forever our little star.',
};

const defaultMonths = [
  'A Beautiful Beginning', 'Little Smiles', 'Growing Curiosity', 'More Little Adventures',
  'Endless Cuddles', 'Halfway to ONE', 'Little Discoveries', 'More Reasons to Smile',
  'Growing Every Day', 'Precious Moments', 'Almost ONE', 'Our Little Birthday Star',
];

function Header() {
  const [open, setOpen] = useState(false);
  const links = [['Our Story', '#story'], ['Memories', '#memories'], ['Timeline', '#timeline'], ['Gallery', '#gallery'], ['Videos', '#videos'], ['Wishes', '#wishes']];
  return (
    <header className="site-header">
      <a className="brand" href="#home" onClick={() => setOpen(false)}><span className="brand-mark">M</span><span>maher ayan<span className="brand-dot">.</span><small>ONE WHOLE YEAR OF LOVE</small></span></a>
      <button className="mobile-menu-button" aria-label="Toggle navigation" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      <nav className={open ? 'nav-open' : ''}>
        {links.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}
        <a className="nav-celebrate" href="#celebrate" onClick={() => setOpen(false)}>Celebrate <ArrowUpRight size={14} /></a>
      </nav>
    </header>
  );
}

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try { await api('/api/public/access', { method: 'POST', body: jsonBody({ password }) }); onUnlock(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to unlock the website.'); }
    finally { setBusy(false); }
  }
  return <main className="gate-screen"><div className="gate-card"><span className="gate-icon"><LockKeyhole /></span><span className="eyebrow">A little world of memories</span><h1>Welcome to<br /><em>Maher Ayan's</em> world</h1><p>This family memory website is password protected. Enter the password to continue.</p><form onSubmit={submit}><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter website password" required /><button className="button button-primary" disabled={busy}>{busy ? 'Checking...' : 'Unlock memories'} <ArrowRight size={16} /></button></form>{error && <small className="form-error">{error}</small>}</div></main>;
}

function PrivateNotice() {
  return <main className="gate-screen"><div className="gate-card"><span className="gate-icon"><Heart /></span><span className="eyebrow">A private family keepsake</span><h1>This little world<br /><em>is private</em></h1><p>Maher Ayan's memory website is not currently open to visitors.</p></div></main>;
}

function Hero({ content, featured }: { content: BirthdayContent; featured?: MediaItem }) {
  const reduceMotion = useReducedMotion();
  return (
    <section className="hero" id="home">
      <div className="hero-orb hero-orb-one" /><div className="hero-orb hero-orb-two" />
      <div className="hero-stars" aria-hidden="true"><span>✦</span><span>✧</span><span>·</span><span>✦</span><span>✧</span></div>
      <div className="hero-copy">
        <motion.div initial={reduceMotion ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="hero-kicker"><span /> A LITTLE CELEBRATION OF LOVE <span /></motion.div>
        <motion.p className="hero-overline" initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>365 DAYS OF WONDER</motion.p>
        <motion.h1 initial={reduceMotion ? false : { opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.9 }}>{content.heroTitle.split(' ').slice(0, 2).join(' ')}<br /><em>{content.heroTitle.split(' ').slice(2).join(' ') || 'of Love'}</em></motion.h1>
        <motion.div className="hero-name" initial={reduceMotion ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.8 }}>{content.babyName}<span>✦</span></motion.div>
        <motion.p className="hero-subtitle" initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>{content.heroSubtitle}</motion.p>
        <motion.p className="hero-description" initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>{content.heroDescription}</motion.p>
        <motion.div className="hero-actions" initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}><a href="#memories" className="button button-primary">Explore our memories <ArrowDown size={16} /></a><a href="#celebrate" className="button button-text">Make a wish <Sparkles size={15} /></a></motion.div>
      </div>
      <motion.div className="hero-visual" initial={reduceMotion ? false : { opacity: 0, scale: 0.92, y: 25 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.35, duration: 1.1 }}>
        <div className="hero-photo-ring"><div className="hero-photo-inner">{featured?.url ? <img src={featured.url} alt={`${content.babyName} - birthday portrait`} /> : <MediaPlaceholder label="Your favourite photo goes here" />}</div></div>
        <div className="hero-note hero-note-top"><Star size={14} fill="currentColor" /> our little sunshine</div>
        <div className="hero-note hero-note-bottom"><Heart size={14} fill="currentColor" /> loved beyond words</div>
        <span className="hero-floating-star star-a">✧</span><span className="hero-floating-star star-b">✦</span>
      </motion.div>
      <a className="hero-scroll" href="#story"><span>SCROLL TO FEEL THE LOVE</span><ChevronDown size={15} /></a>
    </section>
  );
}

function Story({ content, featured }: { content: BirthdayContent; featured?: MediaItem }) {
  return <section className="story-section section-pad" id="story"><div className="story-layout"><div className="story-visual"><div className="story-image-frame">{featured?.url ? <img src={featured.url} alt="A special memory of Maher Ayan" /> : <MediaPlaceholder label="Add a newborn or family photo" />}</div><span className="story-stamp">the beginning<br />of everything</span><span className="story-sparkle">✧</span></div><div className="story-copy"><span className="eyebrow">A STORY WRITTEN IN LITTLE MOMENTS</span><h2>{content.storyTitle}</h2><p>{content.storyText}</p><div className="story-signature">With all our love <span>♡</span></div><a className="text-link" href="#timeline">Walk through the year <ArrowRight size={16} /></a></div></div></section>;
}

function Memories({ images }: { images: MediaItem[] }) {
  const picks = images.slice(0, 3);
  return <section className="memories-section section-pad" id="memories"><SectionTitle eyebrow="A YEAR TO REMEMBER" title="365 days, a million little memories" description="The tiny moments became the biggest treasures. Here's to every smile, every cuddle, and every little discovery." /><div className="memory-grid">{picks.length ? picks.map((item, index) => <motion.article key={item.id} className={`memory-tile memory-tile-${index + 1}`} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.12 }}><div className="memory-tile-image"><MediaImage src={item.url} alt={item.title || 'Maher Ayan memory'} /></div><div className="memory-tile-caption"><span>{item.category || 'A precious moment'}</span><h3>{item.title || item.caption || 'Little moments, big love'}</h3><p>{item.caption || 'A memory to keep close forever.'}</p></div></motion.article>) : <div className="memory-empty"><div className="memory-empty-art"><span>✦</span><span>♡</span><span>✧</span></div><h3>Every little moment deserves a place here.</h3><p>Upload your favourite photos in the admin dashboard to start filling this memory book.</p><a href="/admin" className="text-link">Open memory dashboard <ArrowUpRight size={15} /></a></div>}</div></section>;
}

function Timeline({ items }: { items: TimelineItem[] }) {
  const timeline = items.length ? items : defaultMonths.map((title, index) => ({ id: `placeholder-${index + 1}`, month: index + 1, title, description: 'Add your own little story and photographs for this month.', media: [], sortOrder: index + 1, published: true }));
  return <section className="timeline-section section-pad" id="timeline"><SectionTitle eyebrow="GROWING UP, ONE LITTLE STEP AT A TIME" title="From day one to ONE" description="Twelve little chapters. A lifetime of love. Add the real moments and dates as your story unfolds." /><div className="timeline-list">{timeline.map((item, index) => <motion.article className={`timeline-item ${index % 2 ? 'timeline-reverse' : ''}`} key={item.id} initial={{ opacity: 0, x: index % 2 ? 25 : -25 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.65 }}><div className="timeline-visual">{item.media?.[0]?.url ? <img src={item.media[0].url} alt={item.title} /> : <div className="timeline-placeholder"><span>{String(item.month).padStart(2, '0')}</span><i>month</i><small>✦</small></div>}</div><div className="timeline-dot"><span>{String(item.month).padStart(2, '0')}</span></div><div className="timeline-copy"><span className="eyebrow">CHAPTER {String(item.month).padStart(2, '0')}</span><h3>{item.title}</h3><p>{item.description || 'A little chapter in a very big love story.'}</p>{item.memoryDate && <small className="timeline-date">{new Date(item.memoryDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</small>}</div></motion.article>)}</div></section>;
}

function Gallery({ images }: { images: MediaItem[] }) {
  const [active, setActive] = useState<MediaItem | null>(null);
  const touchStart = useRef<number | null>(null);
  const [category, setCategory] = useState('All');
  const categories = useMemo(() => ['All', ...Array.from(new Set(images.map((item) => item.category).filter(Boolean) as string[]))], [images]);
  const filtered = category === 'All' ? images : images.filter((item) => item.category === category);
  const activeIndex = active ? filtered.findIndex((item) => item.id === active.id) : -1;
  function move(step: number) { if (!filtered.length) return; setActive(filtered[(activeIndex + step + filtered.length) % filtered.length]); }
  useEffect(() => { function key(e: KeyboardEvent) { if (e.key === 'Escape') setActive(null); if (e.key === 'ArrowRight') move(1); if (e.key === 'ArrowLeft') move(-1); } window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key); });
  return <section className="gallery-section section-pad" id="gallery"><SectionTitle eyebrow="A LITTLE WINDOW INTO OUR WORLD" title="Little moments, big memories" description="The smiles we want to remember, the days we wish could last a little longer." />
    {images.length > 0 ? <><div className="gallery-filters">{categories.map((item) => <button key={item} className={category === item ? 'filter-active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="gallery-grid">{filtered.map((item, index) => <motion.button key={item.id} className={`gallery-item gallery-item-${(index % 5) + 1}`} onClick={() => setActive(item)} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (index % 4) * 0.06 }}><img src={item.url} alt={item.title || item.caption || 'Maher Ayan photo memory'} loading="lazy" /><span className="gallery-overlay"><span>{item.title || item.caption || 'A little memory'}</span><ArrowUpRight size={18} /></span></motion.button>)}</div></> : <div className="gallery-empty"><div className="gallery-empty-icon"><Camera size={28} /></div><h3>Your memory gallery is waiting.</h3><p>Upload Maher Ayan's real photographs from the admin dashboard. They will appear here automatically.</p><a href="/admin" className="button button-outline">Manage photographs <ArrowUpRight size={15} /></a></div>}
    <AnimatePresence>{active && <motion.div className="lightbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActive(null)}><button className="lightbox-close" aria-label="Close" onClick={() => setActive(null)}><X /></button><button className="lightbox-prev" aria-label="Previous image" onClick={(e) => { e.stopPropagation(); move(-1); }}><ArrowLeft /></button><div className="lightbox-content" onClick={(e) => e.stopPropagation()} onTouchStart={(e) => { touchStart.current = e.touches[0]?.clientX ?? null; }} onTouchEnd={(e) => { if (touchStart.current !== null) { const delta = e.changedTouches[0].clientX - touchStart.current; if (Math.abs(delta) > 45) move(delta < 0 ? 1 : -1); } touchStart.current = null; }}><img src={active.url} alt={active.title || 'Memory'} /><p>{active.title || active.caption}</p></div><button className="lightbox-next" aria-label="Next image" onClick={(e) => { e.stopPropagation(); move(1); }}><ArrowRight /></button></motion.div>}</AnimatePresence>
  </section>;
}

function Videos({ videos }: { videos: MediaItem[] }) {
  const [active, setActive] = useState<MediaItem | null>(null);
  return <section className="videos-section section-pad" id="videos"><SectionTitle eyebrow="LITTLE MOMENTS IN MOTION" title="The memories that move" description="A giggle, a first step, a familiar little voice — some moments deserve to be played again." />{videos.length ? <div className="video-grid">{videos.map((item) => <button className="video-card" key={item.id} onClick={() => setActive(item)}><span className="video-thumb"><span className="play-circle"><Play fill="currentColor" size={19} /></span><span className="video-corner"><Video size={14} /></span></span><span className="video-meta"><strong>{item.title || 'A little moment in motion'}</strong><small>{item.caption || 'Press play to relive this memory.'}</small></span></button>)}</div> : <div className="video-empty"><span><Video size={25} /></span><div><h3>Little moments, ready to replay.</h3><p>Add family videos from the admin dashboard. Your videos will be displayed here with a simple, elegant player.</p></div></div>}
    <AnimatePresence>{active && <motion.div className="lightbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActive(null)}><button className="lightbox-close" onClick={() => setActive(null)}><X /></button><div className="video-modal" onClick={(e) => e.stopPropagation()}><video src={active.url} controls autoPlay playsInline preload="metadata" /><h3>{active.title}</h3><p>{active.caption}</p></div></motion.div>}</AnimatePresence>
  </section>;
}

function Milestones({ items }: { items: MemoryItem[] }) {
  const milestones = items.length ? items.map((item) => [item.title, item.description || 'A little moment worth remembering.']) : [
    ['A smile that lights up the room', 'A little expression worth remembering.'],
    ['A laugh that makes everything brighter', 'The sweetest sound in our world.'],
    ['Little hands, big discoveries', 'Every day brings something new.'],
    ['A heart surrounded by love', 'A thousand tiny reasons to celebrate.'],
  ];
  return <section className="milestones-section section-pad"><SectionTitle eyebrow="THE LITTLE THINGS THAT MEAN EVERYTHING" title="Things that make you special" description="A collection of tiny details and milestones. Replace these starter notes with the real moments you want to remember." /><div className="milestone-grid">{milestones.map(([title, desc], i) => <motion.article className="milestone-card" key={title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}><span className="milestone-number">0{i + 1}</span><span className="milestone-heart">{['♡', '✦', '☼', '✧'][i]}</span><h3>{title}</h3><p>{desc}</p></motion.article>)}</div><p className="milestone-note">{items.length ? 'These special moments were added by the family.' : 'Personal milestone details can be added through the admin dashboard.'}</p></section>;
}

function Letter({ content }: { content: BirthdayContent }) {
  return <section className="letter-section section-pad" id="letter"><div className="letter-backdrop" /><motion.div className="letter-card" initial={{ opacity: 0, y: 25, rotate: -1 }} whileInView={{ opacity: 1, y: 0, rotate: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}><span className="letter-flower">✿</span><span className="eyebrow">A NOTE FROM THE HEART</span><h2>A little letter<br /><em>for our little star</em></h2><div className="letter-body">{content.birthdayLetter.split('\n').map((line, index) => line ? <p key={index}>{line}</p> : <div key={index} className="letter-space" />)}</div><span className="letter-bottom">with endless love <span>♡</span></span></motion.div></section>;
}

function CakeCelebration() {
  const [wished, setWished] = useState(false);
  function celebrate() {
    setWished(true);
    confetti({ particleCount: 110, spread: 78, origin: { y: 0.68 }, colors: ['#b9dced', '#f6dca7', '#ffffff', '#91bfd9', '#e8c5c7'] });
    window.setTimeout(() => confetti({ particleCount: 45, angle: 60, spread: 55, origin: { x: 0 } }), 220);
    window.setTimeout(() => confetti({ particleCount: 45, angle: 120, spread: 55, origin: { x: 1 } }), 420);
  }
  return <section className="celebrate-section section-pad" id="celebrate"><div className="celebrate-stars"><span>✦</span><span>✧</span><span>✦</span><span>✧</span></div><SectionTitle eyebrow="A MOMENT JUST FOR YOU" title="Make a birthday wish" description="One little candle. One big wish. A whole lot of love." light /><div className={`cake-scene ${wished ? 'cake-wished' : ''}`}><div className="cake-glow" /><div className="cake-candle"><span className="flame" /><span className="wick" /></div><div className="cake-top"><span className="cake-dot dot-one" /><span className="cake-dot dot-two" /><span className="cake-dot dot-three" /></div><div className="cake-layer cake-layer-top" /><div className="cake-layer cake-layer-bottom" /><div className="cake-plate" /><span className="cake-side-star">✦</span><span className="cake-side-heart">♡</span></div><button className="button button-light" onClick={celebrate}>{wished ? <><Check size={17} /> Wish sent with love</> : <><Sparkles size={17} /> Make a birthday wish</>}</button><p className="celebrate-message">{wished ? 'May every little dream find its way to you, Maher Ayan.' : 'Close your eyes, little one. The world is wishing you all the happiness.'}</p></section>;
}

function WishWall({ wishes, allowWishes }: { wishes: Wish[]; allowWishes: boolean }) {
  const [name, setName] = useState(''); const [relationship, setRelationship] = useState(''); const [message, setMessage] = useState(''); const [website, setWebsite] = useState(''); const [status, setStatus] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); setBusy(true); setStatus(''); try { const result = await api<{ message: string }>('/api/public/wishes', { method: 'POST', body: jsonBody({ name, relationship, message, website }) }); setStatus(result.message); setName(''); setRelationship(''); setMessage(''); } catch (error) { setStatus(error instanceof Error ? error.message : 'Unable to send your wish.'); } finally { setBusy(false); } }
  return <section className="wishes-section section-pad" id="wishes"><SectionTitle eyebrow="A LITTLE LOVE FROM EVERYONE" title="Love and wishes for Maher" description="A beautiful collection of kind words from the people who make this little world brighter." /><div className="wishes-layout"><div className="wish-wall">{wishes.length ? wishes.map((wish, index) => <motion.article className="wish-card" key={wish.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }}><span className="wish-quote">“</span><p>{wish.message}</p><div className="wish-author"><span className="wish-avatar">{wish.name.slice(0, 1).toUpperCase()}</span><span><strong>{wish.name}</strong><small>{wish.relationship || 'Sending love'}</small></span></div></motion.article>) : <div className="wish-empty"><Heart size={24} /><h3>Be the first to leave a little love.</h3><p>Approved wishes from family and friends will appear here.</p></div>}</div>{allowWishes && <form className="wish-form" onSubmit={submit}><span className="eyebrow">LEAVE A LITTLE NOTE</span><h3>Send your birthday wishes</h3><label>Your name<input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={100} placeholder="Your name" /></label><label>How do you know Maher? <span>(optional)</span><input value={relationship} onChange={(e) => setRelationship(e.target.value)} maxLength={100} placeholder="Aunt, uncle, friend..." /></label><label>Your message<textarea value={message} onChange={(e) => setMessage(e.target.value)} required minLength={5} maxLength={1200} rows={4} placeholder="Write something lovely..." /></label><input className="honeypot" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" /><button className="button button-primary" disabled={busy}>{busy ? 'Sending...' : 'Send your wish'} <Send size={15} /></button>{status && <p className="form-status">{status}</p>}<small className="form-footnote">Your message will appear after it is approved by the family.</small></form>}</div></section>;
}

function MusicPlayer({ media, enabled }: { media: MediaItem | null; enabled: boolean }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => { if (!media?.url) return; const audio = new Audio(media.url); audio.loop = true; audio.volume = 0.35; audioRef.current = audio; return () => { audio.pause(); audioRef.current = null; }; }, [media?.url]);
  if (!enabled || !media?.url) return null;
  async function toggle() { if (!audioRef.current) return; if (playing) { audioRef.current.pause(); setPlaying(false); } else { try { await audioRef.current.play(); setPlaying(true); } catch { setPlaying(false); } } }
  return <button className="music-toggle" onClick={toggle} aria-label={playing ? 'Pause background music' : 'Play background music'}>{playing ? <Pause size={16} /> : <Play size={16} />}<Music2 size={14} /></button>;
}

export default function HomePage() {
  const [data, setData] = useState<BootstrapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [gate, setGate] = useState<'none' | 'password' | 'private'>('none');
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    if (!data?.settings) return;
    document.title = data.settings.siteTitle || 'Maher Ayan | One Whole Year of Love';
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute('content', data.settings.metaDescription || 'Celebrating Maher Ayan.');
    const robots = document.querySelector('meta[name="robots"]');
    if (robots) robots.setAttribute('content', data.settings.searchIndexingEnabled ? 'index,follow' : 'noindex,nofollow');
  }, [data?.settings]);
  useEffect(() => {
    let active = true;
    api<BootstrapData>('/api/public/bootstrap').then((result) => { if (active) { setData(result); setGate('none'); } }).catch((error: Error & { status?: number }) => {
      if (!active) return;
      if (error.status === 401) setGate('password');
      else if (error.status === 404) setGate('private');
      else setData({ content: null, settings: null, media: [], timeline: [], wishes: [], memories: [], backgroundMusic: null });
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [refresh]);
  if (loading) return <div className="loading-screen"><div className="loading-mark">M</div><p>Preparing a little world of love...</p></div>;
  if (gate === 'password') return <PasswordGate onUnlock={() => setRefresh((value) => value + 1)} />;
  if (gate === 'private') return <PrivateNotice />;
  const content = data?.content ?? fallbackContent;
  const media = data?.media ?? [];
  const images = media.filter((item) => item.type === 'IMAGE');
  const videos = media.filter((item) => item.type === 'VIDEO');
  const featured = images.find((item) => item.featured) ?? images[0];
  return <div className="app-shell"><Header /><main><Hero content={content} featured={featured} /><Story content={content} featured={featured} /><Memories images={images} /><Timeline items={data?.timeline ?? []} /><Gallery images={images} /><Videos videos={videos} /><Milestones items={data?.memories ?? []} /><Letter content={content} /><CakeCelebration /><WishWall wishes={data?.wishes ?? []} allowWishes={data?.settings?.allowWishes ?? true} /></main><footer className="site-footer"><div className="footer-brand"><span className="brand-mark">M</span><span>maher ayan<span className="brand-dot">.</span></span></div><p>{content.footerMessage}</p><span className="footer-heart">Made with <Heart size={13} fill="currentColor" /> for Maher Ayan</span><a href="#home" className="back-top">Back to the beginning ↑</a><a href="/admin" className="admin-link">Family admin</a></footer><MusicPlayer media={data?.backgroundMusic ?? null} enabled={data?.settings?.backgroundMusicEnabled ?? false} /></div>;
}
