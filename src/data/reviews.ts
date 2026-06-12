// Deep editorial takes — keyed by product id from products.ts.
// Products with an entry here get an expandable "Our Take" on cards and their own /reviews/ page.

export interface OurTake {
  whyItWins: string;
  whoItsFor: string;
  longTerm: string;
  watchOut: string;
}

export const reviews: Record<string, OurTake> = {
  // ── USB-C Hubs ──────────────────────────────────────────────────────────
  "anker-usbc-hub-7in1": {
    whyItWins: "Anker took the seven ports people actually use — HDMI, two USB-A, SD, microSD, USB-C data, and PD passthrough — and put them in an aluminum shell that doesn't cook itself. There's no port you'll never touch inflating the price, and no flaky Ethernet jack to fail first. It's the boring, correct answer in a category full of gimmicks.",
    whoItsFor: "Laptop owners who dock at a desk or work from cafés and need the missing ports back without thinking about it. If your needs are 'one monitor, my mouse dongle, and a card reader,' stop researching — this is the one.",
    longTerm: "Owner reports at the two-year mark are unusually clean for this category: the failure pattern that kills cheap hubs (HDMI handshake death after months of heat) barely shows up. The braided-feel cable and shell wear well; ours rides in a bag daily.",
    watchOut: "4K output is capped at 30Hz — fine for documents, noticeably stuttery for video editing on an external display. And there's no Ethernet, so wired-network people should look at the UGREEN 9-in-1 instead.",
  },
  "ugreen-usbc-hub-9in1": {
    whyItWins: "For about $10 over the Anker it adds the two ports that matter on a desk: Gigabit Ethernet and a second display output. Video calls over Wi-Fi are a gamble you don't need to take, and the wired jack here is the cheapest insurance policy in tech.",
    whoItsFor: "The desk-docked worker — laptop in the same spot every day, monitor on an arm, calls all morning. Travelers should take the smaller Anker; this one's extra ports earn their bulk only if they stay plugged in.",
    longTerm: "UGREEN's hubs have quietly become the r/UsbCHardware default recommendation, and the long-term threads back it up: the Ethernet port — historically the first thing to die on cheap hubs — holds up here. It runs warm under dual-display load, which is normal; hot is not.",
    watchOut: "The VGA port shares bandwidth with HDMI, so dual-display mode drops you to 1080p on both. And max charging passthrough assumes your charger has headroom — pair it with at least a 65W brick.",
  },
  "baseus-usbc-hub-13in1": {
    whyItWins: "Thirteen ports — dual HDMI, Ethernet, audio, three USB-A, card readers, 100W PD — for the price of a nice dinner. It's the only sub-$60 hub that genuinely replaces a docking station for a multi-monitor desk setup.",
    whoItsFor: "Windows laptop users running two external monitors who refuse to pay CalDigit prices. It's overkill for a single-screen setup — buy the Anker and save $20.",
    longTerm: "The thermal load of 13 active ports is real: owners report it running hot during simultaneous dual-display + charging + file-transfer sessions. Spread out on a desk with airflow it's lasted owners years; buried under a laptop it won't.",
    watchOut: "Base M-series MacBooks only drive one external display over USB-C, no matter how many HDMI ports this has — that's an Apple limitation, not a defect, but it's the #1 reason for returns. Check your laptop's display-out spec before buying.",
  },

  // ── Webcams ─────────────────────────────────────────────────────────────
  "logitech-c920s": {
    whyItWins: "A decade of driver maturity means the C920s works — instantly, on everything, forever. The 1080p30 image with auto light correction is still better than 95% of built-in laptop cameras, and the physical privacy shutter answers the tape-over-the-lens problem properly.",
    whoItsFor: "Anyone who wants meetings handled and never wants to think about their webcam again. It's also the safe pick for locked-down work laptops where exotic camera software won't install.",
    longTerm: "These things simply refuse to die — it's common to find C920-family cams on their third laptop and seventh year. The image hasn't aged as well as the hardware: in 2026 it reads 'perfectly fine,' not 'sharp.'",
    watchOut: "Low-light performance is where its age shows; in a dim room it gets grainy fast. If your desk has bad lighting, the Razer Kiyo's ring light or the Anker C200's better sensor will serve you better than this classic.",
  },
  "anker-powerconf-c200": {
    whyItWins: "The best image quality per dollar in webcams right now: a 2K sensor that resolves visibly more detail than the C920s, handles mixed lighting gracefully, and includes a usable auto-framing mode — at the same street price as the decade-old Logitech.",
    whoItsFor: "Daily video-callers buying their own gear who want to look noticeably better than their colleagues without studying camera settings. It's the 'just buy this' answer for new WFH setups in 2026.",
    longTerm: "Newer product, shorter track record — but two years of owner reviews show none of the firmware flakiness that plagued early challenger webcams. The integrated privacy cover survives daily flipping.",
    watchOut: "The built-in mics are mediocre — fine as a backup, but use your headset for calls. And 2K output requires apps that support it; Zoom will happily downscale it to 1080p anyway, where the sensor still wins on clarity.",
  },
  "logitech-brio-4k": {
    whyItWins: "The Brio is what you buy when video is part of your job: a 4K sensor with genuine HDR, Windows Hello IR login, and adjustable field of view. Recorded locally, the footage is in a different league from any 1080p webcam.",
    whoItsFor: "Course creators, YouTubers recording at a desk, and executives who do high-stakes external calls. If you only do internal Zoom meetings, you're paying for pixels the platform will throw away.",
    longTerm: "It's been Logitech's flagship for years, which means mature firmware and long parts availability. Owners' main long-term note: it's heavy enough that cheap monitor mounts sag — the included clip is fine, third-party mounts vary.",
    watchOut: "4K30 needs a real USB 3.0 connection and decent CPU; on old laptops it falls back to lesser modes silently. Windows Hello is fantastic — but Mac users get none of those extras, weakening the value case on macOS.",
  },

  // ── Wireless Earbuds ────────────────────────────────────────────────────
  "sony-wf-1000xm5": {
    whyItWins: "The strongest noise cancellation in any earbud, sound quality that embarrasses most over-ears, and Sony's LDAC codec for Android users who care about bitrate. When people say 'flagship earbuds,' this is the technical benchmark they're measuring against.",
    whoItsFor: "Commuters, flyers, and open-office workers on Android (or platform-agnostic iPhone users). If your day involves engine drone or chatty coworkers, the ANC alone justifies the price.",
    longTerm: "Battery chemistry is the ceiling on all earbuds — expect 2–3 strong years. Within that window, Sony's firmware support is excellent; the foam tips wear out and should be budgeted as a consumable.",
    watchOut: "The polished case is a fingerprint magnet and the buds can be fiddly to grip with dry hands. iPhone users lose LDAC and the deep OS integration AirPods get — at this price, ecosystem fit should drive the decision.",
  },
  "tozo-t6": {
    whyItWins: "Twenty-six dollars buys punchy sound, a fit that survives burpees, IPX8 waterproofing, and a wireless-charging case. The spec sheet reads like a $100 product from three years ago, and tens of thousands of gym bags agree.",
    whoItsFor: "Anyone whose earbuds live a hard life — workouts, job sites, beach days — or who loses earbuds often enough that pricier pairs feel like gambling. It's also the perfect 'first wireless earbuds' gift.",
    longTerm: "At this price the realistic lifespan is 18–24 months of heavy use, and owners treat that as fair. TOZO's habit of honoring warranty claims quickly shows up constantly in reviews and is half the brand's reputation.",
    watchOut: "There's no ANC and no transparency mode — outside noise is managed by the seal alone. Touch controls are sensitive enough to trigger while adjusting; you'll mispause things during your first week.",
  },
  "soundcore-p3i": {
    whyItWins: "Real, functioning noise cancellation under $40 used to be a contradiction; Anker's Soundcore line made it routine. The P3i adds a 36-hour case and an EQ app that lets you fix its slightly bass-heavy default tuning.",
    whoItsFor: "Budget buyers who commute. The difference between 'no ANC' and 'decent ANC' on a bus is bigger than the difference between decent and great — this delivers that first jump for TOZO money.",
    longTerm: "Soundcore firmware support is the best in the budget tier, and the case hinge — the usual cheap-earbud failure point — holds up. Expect the same ~2-year battery arc as everything else in the category.",
    watchOut: "ANC at this price handles steady drone (engines, HVAC) but not voices — don't expect office chatter to vanish. Call quality in wind is mediocre; frequent callers should look elsewhere.",
  },

  // ── Desk Accessories ────────────────────────────────────────────────────
  "ergotron-lx-monitor-arm": {
    whyItWins: "The LX is the monitor arm other arms are cloned from: fluid one-hand adjustment, a genuine 25-pound capacity that doesn't sag, and a 10-year warranty the company actually honors. It turns monitor position from a furniture decision into a gesture.",
    whoItsFor: "Anyone with neck strain, a standing desk, or an ultrawide. If you adjust your monitor more than never — or share a desk with someone of different height — the premium over cheap arms pays back daily.",
    longTerm: "This is the rare product where 'buy it for life' isn't hyperbole: decade-old LX arms hold modern monitors fine, and the polished aluminum doesn't yellow or flake. Used ones barely lose value, which says everything.",
    watchOut: "Very light monitors (under ~7 lbs) can't compress the spring enough to stay put without tension adjustment — read the manual's tension section before assuming yours is defective. Clamp depth needs ~2.4 inches of desk overhang.",
  },
  "benq-screenbar-plus": {
    whyItWins: "Asymmetric optics light your desk surface without throwing a single ray of glare into the screen — a trick desk lamps physically can't do. It mounts on the monitor itself, so it costs zero desk space, and the auto-dimming matches ambient light without thought.",
    whoItsFor: "Anyone who works after sunset and has noticed their eyes are tired at 9 PM. It sounds like a luxury until you use one for a week; then it's infrastructure.",
    longTerm: "LEDs are rated for years of nightly use and owner reports back that up — the common five-year-old ScreenBar complaint is dust, not death. The weighted clamp design fits monitors it never knew about, including curved ones with adapter tricks.",
    watchOut: "It won't sit on ultra-thin bezel-less monitors with rear humps without some fiddling — check the clamp compatibility list for your exact panel. USB-powered means one more cable for your management scheme.",
  },
  "logitech-mx-master-3s": {
    whyItWins: "The electromagnetic scroll wheel alone — silent, infinitely spinnable, auto-shifting between ratchet and free-spin — changes how spreadsheets and long documents feel. Add app-specific button profiles, three-device switching, and a shape ergonomists keep blessing, and it's the productivity mouse.",
    whoItsFor: "Knowledge workers living in Excel, code, or 4,000-row anything. Gamers should skip it — the sensor is fine but the weight and latency philosophy are office-first.",
    longTerm: "MX Master mice routinely outlive the laptops they were bought with; the 3S fixed the rubber-coating wear that aged the 2S. Batteries hold weeks per charge even years in.",
    watchOut: "It's a large, right-handed-only mouse — small hands and lefties are excluded by design. The quiet-click switches feel mushy to people coming from gaming mice; try the click before committing if that matters to you.",
  },

  // ── Gaming Gear ─────────────────────────────────────────────────────────
  "logitech-g305-gaming-mouse": {
    whyItWins: "The HERO sensor in the G305 was flagship-grade when it launched and remains genuinely better than what ships in most $60 mice. Logitech's LIGHTSPEED wireless adds zero perceptible latency, and one AA battery runs it for most of a year.",
    whoItsFor: "Anyone entering PC gaming, anyone who wants a clean desk without wireless anxiety, and competitive players on a budget. Its small-medium shape suits claw and fingertip grips best.",
    longTerm: "G305s are cockroaches in the best way — five-year-old units with original switches are everywhere. The AA battery is a feature in disguise: no lithium pack to degrade, just swap and go.",
    watchOut: "Large-handed palm-grippers will find it cramped; that's the main legitimate complaint. The plastic is light but hollow-feeling — it's durable, it just doesn't feel expensive.",
  },
  "razer-basilisk-v3": {
    whyItWins: "Eleven programmable buttons, a smart-shift scroll wheel that free-spins, and Razer's best-in-class optical switches that physically cannot double-click from wear — for around $50 wired. Feature-per-dollar, nothing in the mid-tier touches it.",
    whoItsFor: "MMO and MOBA players, productivity multitaskers who macro everything, and large-handed palm grippers — the broad, thumb-rested shape is built for them.",
    longTerm: "Optical switches sidestep the double-click death that plagues mechanical mouse switches at year two — that's the quiet long-term win. The braided cable and PTFE feet wear gracefully.",
    watchOut: "At 101 grams it's a tank — flick-heavy FPS players will feel it versus 60-gram esports mice. Synapse software remains Razer's weak point: functional, but it nags and updates more than it should.",
  },
  "hyperx-cloud-stinger": {
    whyItWins: "Fifty-millimeter drivers, 90-degree swivel cups, and a flip-to-mute mic at a price where most headsets sound like phone speakers in a tin. The Stinger has been the budget-headset answer for years because it nails the only two things that matter: comfort and clarity.",
    whoItsFor: "New PC gamers, console players, and anyone replacing a broken headset without wanting research homework. It's the headset to recommend when someone says 'under $50, just works.'",
    longTerm: "The headband and sliders — the death points of cheap headsets — are steel-reinforced and survive years of being yanked off by the cups. Earpad foam compresses by year two; replacements are cheap and standard-sized.",
    watchOut: "It's wired, 3.5mm only — no USB, no software, no surround processing. The mic is clear but picks up room noise; streamers should treat it as a starter, not a destination.",
  },

  // ── Desk Toys & Fun ─────────────────────────────────────────────────────
  "divoom-ditoo-pixel-speaker": {
    whyItWins: "A surprisingly decent Bluetooth speaker wearing a retro pixel-art display that does clocks, equalizers, notifications, and whatever your inner 1989 wants to draw. It's the rare desk gadget with three real jobs — speaker, clock, mood — plus one fake one (joy).",
    whoItsFor: "Desk decorators, gift givers who need a guaranteed hit, and anyone whose video-call background could use one charismatic object. Works for gamers and non-gamers alike.",
    longTerm: "The app ecosystem is the moat — Divoom keeps shipping features and the community keeps making pixel art, so it doesn't go stale like single-trick gadgets. The battery degrades like any speaker's; desk-powered use sidesteps it.",
    watchOut: "The app wants an account and more permissions than a clock should; grant the minimum. Audio is good-for-its-size, not good-period — it replaces a phone speaker, not a real one.",
  },
  "levitating-moon-lamp": {
    whyItWins: "A moon that floats. The magnetic levitation is genuinely stable once balanced, the print texture is accurate enough to identify maria, and the spinning, glowing result stops conversation in a way no $40 object should.",
    whoItsFor: "Gift buyers, above all — this is the highest reaction-per-dollar object on the site. Also anyone furnishing a shelf, studio backdrop, or bedside table that needs one piece of quiet magic.",
    longTerm: "The electromagnet base runs continuously and owners report years of uneventful floating; power cuts just mean re-balancing (a two-minute knack you'll acquire). The lamp half is sealed — when its LED eventually fades, that's the lifespan.",
    watchOut: "Initial balancing takes patience the first time — people who return these almost always gave up in minute one. Keep it away from desk edges, cats, and toddlers, who are all magnetically attracted to it for different reasons.",
  },
  "nanoleaf-shapes-triangles": {
    whyItWins: "Modular wall panels that sync to music and screen content, controlled by every smart-home ecosystem at once (Matter, HomeKit, Alexa, Google). It's the difference between 'a desk with lights' and 'a setup' — the piece that makes the room look intentional.",
    whoItsFor: "Streamers and anyone building a battlestation that appears on camera. Also legitimate as ambient room lighting for people who find lamps boring — it's furniture-grade decor, not a toy.",
    longTerm: "Nanoleaf's panels have a decade-long track record and the Shapes line keeps backward compatibility — panels you add in three years will click into today's set. The adhesive mounting is the weak point: use the screw mounts on textured walls.",
    watchOut: "The starter kit's coverage is smaller than photos suggest; most owners end up wanting an expansion pack, so budget for the real total. Removing command-strip-mounted panels from bad paint takes paint with it.",
  },

  // ── Smart Home ──────────────────────────────────────────────────────────
  "amazon-echo-dot-5": {
    whyItWins: "The fifth-gen Dot finally sounds like a real speaker, and it remains the cheapest competent entry point to voice control — timers, music, smart-home commands, intercom — with the broadest device compatibility in the industry.",
    whoItsFor: "First-time smart-home households and anyone expanding Alexa room-by-room (the Dots' multi-room audio is the sleeper feature). Google-household members should buy a Nest instead and keep the peace.",
    longTerm: "Amazon supports Echos with updates for many years, and the hardware has no moving parts to fail. The realistic 'end of life' is you upgrading for sound, not it breaking.",
    watchOut: "It's a cloud device from an ad company — audit the privacy settings once (mic history, hunches) and it behaves. Sound is good for its size; it won't fill a living room for parties.",
  },
  "philips-hue-starter": {
    whyItWins: "Hue's Zigbee bridge is why it costs more and why it's worth it: lights respond instantly, work when the internet is down, and never clog your Wi-Fi. The ecosystem of dimmers, motion sensors, and third-party apps is years ahead of every Wi-Fi bulb brand.",
    whoItsFor: "People planning a real lighting system — multiple rooms, wall controllers, automations — rather than testing a single smart bulb. For one lamp, buy Kasa and pocket the difference.",
    longTerm: "Hue bulbs are the longevity outliers of smart lighting; original 2012-era bulbs are still in service. Philips' decade of bridge firmware support is the standard everyone else gets measured against.",
    watchOut: "The per-bulb price after the starter kit stings — a whole-house Hue conversion is a four-figure hobby. The bridge needs an Ethernet port on your router, which surprises some apartment mesh-network setups.",
  },
  "govee-led-strip-lights": {
    whyItWins: "Thirty-three feet of app-controlled, music-reactive RGB for the price of two coffees per meter. Govee's app is genuinely good — scenes, schedules, mic-based sync — which is what separates it from the sea of anonymous strip lights.",
    whoItsFor: "Desk and TV backlighting, dorm rooms, and anyone testing whether they're an 'RGB person' before investing real money. It's the gateway drug of ambient lighting.",
    longTerm: "The LEDs outlast the adhesive — the universal owner experience is re-sticking sagging sections with channel mounts or better tape around year one. Plan for that and the strip itself runs for years.",
    watchOut: "One controller drives the whole strip as one zone color-wise on this model — per-segment effects need Govee's pricier RGBIC lines. Measure before buying: cutting is fine, extending is not.",
  },

  // ── Portable Tech ───────────────────────────────────────────────────────
  "anker-powercore-10000": {
    whyItWins: "Genuine 10,000mAh in a deck-of-cards footprint, from the one budget brand whose capacity claims survive testing. Two full phone charges, pocketable weight, and Anker's warranty make it the default answer to 'which power bank?'",
    whoItsFor: "Everyone — this is the rare universal recommendation. Commuters, travelers, festival-goers, parents whose kids' devices are always at 4%.",
    longTerm: "Anker cells age gracefully: expect ~80% capacity after a couple of years of regular cycles, which still beats a dead phone. The shell scuffs cosmetically and survives drops that would kill a phone.",
    watchOut: "This model charges via USB-C but slowly refills itself overnight — fast-recharge needs the pricier Prime line. No wireless charging pad here either; it's deliberately the simple one.",
  },
  "apple-airtag-4pack": {
    whyItWins: "Apple's Find My network means a lost AirTag gets silently pinged by nearly every iPhone that walks past it — in cities, recovery stories read like magic. Setup is ten seconds and precision finding walks you to the couch cushion it's under.",
    whoItsFor: "iPhone households, full stop. Keys, wallets, luggage, cars, kids' backpacks — the 4-pack disappears into daily life immediately.",
    longTerm: "User-replaceable CR2032 batteries (about a year each) make these effectively permanent — no sealed battery countdown like most trackers. Apple's network only gets denser.",
    watchOut: "Android users can detect an unwanted AirTag near them but can't own one — zero cross-platform utility. It also doesn't ring loudly; in a noisy room the speaker is more 'polite chime' than alarm.",
  },
  "tile-mate-tracker": {
    whyItWins: "Tile works on both iOS and Android, rings louder than an AirTag, and its killer party trick runs in reverse: double-press the Tile to make your silenced phone scream. For mixed-platform households it's the only tracker that makes sense.",
    whoItsFor: "Android users (where it's the clear default) and families split across phone platforms. Also anyone who loses their phone more than their keys — that reverse-ring earns its keep weekly.",
    longTerm: "The network is smaller than Apple's, so lost-item recovery in public depends on Tile-app density in your city. The built-in 3-year battery on current Mates removes the old replace-the-Tile annoyance.",
    watchOut: "Premium features Tile advertises (smart alerts, location history) sit behind a subscription — the free tier covers the core well, but read what's included before expecting AirTag-network parity.",
  },

  // ── Monitors ────────────────────────────────────────────────────────────
  "samsung-odyssey-g5": {
    whyItWins: "1440p at 165Hz with a 1000R curve for roughly $250 — the spec combination that made high-refresh gaming mainstream. The VA panel's contrast makes dark games look properly dark, something IPS rivals at this price can't do.",
    whoItsFor: "Single-player and immersion-focused gamers upgrading from 1080p60, especially in dim rooms where VA contrast shines. Competitive FPS players should weigh the ASUS TUF's faster panel instead.",
    longTerm: "The G5 has been through years of revisions and the panel lottery has settled; current units are consistent. VA's known quirk — slight black smearing in fast dark scenes — doesn't worsen with age, you just decide once whether you notice it.",
    watchOut: "No speakers and a wobbly stock stand — budget for a monitor arm (it's VESA-ready). The 1000R curve is polarizing for productivity work; straight lines near the edges look curved because they are.",
  },
  "asus-tuf-vg27aq": {
    whyItWins: "The VG27AQ's IPS panel does what VA can't: accurate color, wide viewing angles, and ASUS's ELMB-Sync running motion blur reduction simultaneously with adaptive sync — a combination still rare at this price. It's the do-everything 1440p monitor.",
    whoItsFor: "Players who split time between competitive shooters and everything else, plus anyone who also works on their gaming monitor — the color accuracy is good enough for serious photo editing.",
    longTerm: "This panel generation is famously durable; the VG27AQ has years of heavy-use reports with minimal backlight degradation. ASUS firmware is set-and-forget.",
    watchOut: "IPS glow in dark scenes is the trade for the colors — corners lift slightly in black scenes, a panel-tech fact, not a defect. HDR support is nominal (HDR10 accepted, not meaningfully displayed).",
  },
  "alienware-aw3423dwf": {
    whyItWins: "Quantum-dot OLED: per-pixel light control, infinite contrast, and color volume no LCD approaches — in a 175Hz ultrawide that made $1,000+ gaming monitors feel obsolete at launch. Games you know look like different games on it.",
    whoItsFor: "Enthusiasts making their one big display purchase of the decade, sim racers, and RPG players. If your budget says 'either a GPU upgrade or this,' most owners say the monitor changed more.",
    longTerm: "Burn-in is the question everyone asks; Dell answered with a 3-year warranty that covers it — the strongest such coverage in the category. Mixed-use owners at the multi-year mark report panels indistinguishable from new; static-taskbar-all-day workers should still think twice.",
    watchOut: "Text rendering on the unusual subpixel layout bothers some coders — fringe color on small fonts. The glossy-adjacent coating loves reflections; control your room lighting or the perfect blacks reflect your lamp.",
  },

  // ── Streaming Gear ──────────────────────────────────────────────────────
  "blue-yeti-usb-mic": {
    whyItWins: "The Yeti is the default USB mic of the last decade for a reason: broadcast-adjacent sound with literally zero setup, hardware mute and gain on the body, and four pickup patterns covering everything from solo streams to two-person interviews.",
    whoItsFor: "First-mic buyers who want their voice to stop sounding like a laptop. Streamers, podcasters, and meeting-heavy professionals all start here for the same reason.",
    longTerm: "Built like a desk ornament from the 1950s — the common decade-old Yeti still works perfectly. The included stand transmits desk thumps; most owners eventually add a boom arm, which doubles its perceived quality.",
    watchOut: "Its sensitivity is the classic gotcha: it hears your keyboard, chair, and room echo with the same enthusiasm as your voice. Get it close to your mouth and learn the gain knob, or it'll sound worse than cheaper, more forgiving mics.",
  },
  "elgato-stream-deck-mk2": {
    whyItWins: "Fifteen LCD keys that do anything — scene switches, audio mutes, sound effects, app launches, smart lights — with an ecosystem of plugins so deep it's become productivity hardware that happens to be sold to streamers.",
    whoItsFor: "Streamers past their first month, yes, but equally video editors, day traders, and anyone whose workflows have more than five repetitive steps. It's a macro pad with a marketing budget, and a great one.",
    longTerm: "The software ecosystem keeps growing years in, which keeps old hardware relevant — MK.1 units from 2017 still run current software. Key LCDs show no burn-in patterns across years of reports.",
    watchOut: "It's a luxury until your workflow earns it — new streamers see it as required equipment, and it isn't; OBS hotkeys are free. The software runs resident and occasionally needs a restart after major OS updates.",
  },
  "shure-sm7b": {
    whyItWins: "The microphone behind half of broadcast, podcasting, and several decades of records. Its cardioid pattern and tuned rejection make untreated rooms sound treated, and its ceiling is effectively your skill — nobody outgrows an SM7B.",
    whoItsFor: "Serious podcasters, full-time streamers, and voice professionals who already own an audio interface and know what gain staging means. It is a destination purchase, not a starting point.",
    longTerm: "These are multi-decade tools — SM7s from the 80s are working in studios today. There is no firmware, no battery, no software: just a transducer that holds value so well used prices barely dip.",
    watchOut: "The real cost is the chain: it needs ~60dB of clean gain, which means a quality interface and often a Cloudlifter-style booster — budget $500+ all-in. Plugged into a cheap interface, it will sound worse than a $100 USB mic, and that's the most common 1-star story.",
  },

  // ── Audio ───────────────────────────────────────────────────────────────
  "audio-technica-ath-m50x": {
    whyItWins: "The reference budget studio headphone — tuned honest enough to mix on, fun enough to commute with, and efficient enough to run from a phone. Twenty years of revisions refined it into the most-recommended headphone on the internet, and the consensus is earned.",
    whoItsFor: "Anyone making their first real headphone purchase, home producers, and listeners who want to hear what their music actually sounds like before chasing flavors.",
    longTerm: "The folding hinges and earpads are the wear points; both are cheap, standard replacements — M50x units routinely live a decade on their second or third pads. The detachable cable design ended the category's classic death-by-frayed-cable.",
    watchOut: "Clamp is firm out of the box (it relaxes) and the stock pads get sweaty in summer. The treble is detailed to a fault for sensitive ears — audition sibilant tracks if you're treble-shy.",
  },
  "sony-wh-1000xm5": {
    whyItWins: "The complete wireless package: top-tier ANC, the best call quality in consumer headphones, multipoint pairing that actually works, and thirty hours of battery. It's what 'flagship wireless headphone' means in 2026.",
    whoItsFor: "Flyers, commuters, and open-office survivors who want one headphone for everything. Apple-ecosystem loyalists should cross-shop AirPods Max; everyone else lands here.",
    longTerm: "Sony's firmware support runs years deep, and the XM-series batteries age slower than earbuds (bigger cells, gentler cycles) — XM3s from 2018 are still daily drivers. The new non-folding design needs its case for travel.",
    watchOut: "They don't fold flat-to-small anymore — the case is a permanent bag tenant. Audiophiles will note the tuning favors pleasant over precise; that's the right call for the audience, but wired studio cans beat it on pure fidelity per dollar.",
  },
  "moondrop-chu-ii": {
    whyItWins: "Twenty dollars of properly engineered audio: a single dynamic driver tuned to a research-derived target curve, metal shells, and a detachable cable — at a price where competitors ship landfill. It's the cheat code answer to 'good sound, no money.'",
    whoItsFor: "Students, side-sleepers' desk drawers, gym bags, and skeptics who don't believe $20 can sound good. Also audiophiles who want a beater that doesn't insult their ears.",
    longTerm: "The detachable 2-pin cable means the usual IEM death (cable failure) is a $10 fix, not a replacement. Driver-wise there's nothing to wear out; owners mostly lose them before they break them.",
    watchOut: "No microphone on the standard cable — phone-call people need the mic variant or a different pick. Isolation depends entirely on tip fit; spend the five minutes trying all included sizes.",
  },

  // ── Gaming Setups ───────────────────────────────────────────────────────
  "secretlab-titan-evo": {
    whyItWins: "The Titan Evo ended the 'gaming chairs are bad ergonomics' era: integrated 4-way lumbar, a cold-cure foam bench seat instead of bucket-seat bolsters, and build quality that makes office-chair money look silly. It's the chair r/battlestations stopped arguing about.",
    whoItsFor: "Anyone sitting 6+ hours daily who wants one purchase to fix it — gamers, remote workers, both. Size variants (XS–XL) mean it actually fits small and tall bodies, which generic chairs don't.",
    longTerm: "This is where it beats the $150 lookalikes: the foam doesn't pancake, the hydraulics don't sink, and the upholstery survives years — Secretlab's own resale market is full of decade-plans, not regrets. The 2022 model's magnetic armrest tops are replaceable as parts.",
    watchOut: "It ships heavy and assembly is a two-person job done comfortably. The seat is firm by design — owners from soft chairs need a two-week adjustment period, and some never convert; firm is a preference, not a universal upgrade.",
  },
  "steam-deck-oled": {
    whyItWins: "Your Steam library, on an OLED screen, on a couch, with suspend/resume that treats 30-second play sessions as first-class. Valve's SteamOS does the impossible: PC gaming with console simplicity, and the OLED revision fixed battery life and screen — the original's only real complaints.",
    whoItsFor: "PC gamers with backlogs and lives — parents, commuters, travelers. If your gaming time fragmented and your desktop sits unused, this un-fragments it.",
    longTerm: "Valve's track record here is exceptional: years of meaningful software updates, official repair parts via iFixit, and a verified-games program that keeps growing. It's the rare handheld designed to be owned, opened, and upgraded (the SSD swap is 20 minutes).",
    watchOut: "Heavy AAA releases need settings humility — this is 800p hardware by design, brilliant at 30–60fps medium, not a 4K rig. Non-Steam launchers (Game Pass especially) require tinkering the Ally crowd doesn't face.",
  },
  "logitech-g-pro-superlight-2": {
    whyItWins: "Sixty grams, a flawless sensor, and the shape esports settled on — refined rather than reinvented. The 2 adds USB-C, better switches, and 95 hours of battery to the most-used mouse in professional play. At this tier, 'no flaws' is the feature.",
    whoItsFor: "Competitive FPS players and shape-sensitive gamers whose hands already know the GPX silhouette. Casual players are paying a pro-tax for headroom they won't use — the G305 delivers 90% for a third of the price.",
    longTerm: "The hybrid optical-mechanical switches address the double-click failures that hit the original GPX at scale — early-adopter reports across two years are clean. PTFE feet and a swappable shell keep it serviceable.",
    watchOut: "No RGB, no weight system, no extra buttons — minimalism is the product, and feature-seekers will feel shortchanged. The symmetric shape has no thumb rest; Basilisk-style ergo fans won't convert.",
  },
};

export function getReview(productId: string): OurTake | undefined {
  return reviews[productId];
}
