# Project Brief: "Life of a Request" — Interactive Networking Visualizer

> Handoff doc for Claude Code. Everything below comes from a learning conversation Sam had with Claude.
> Goal: an interactive, publishable site that shows what *really* happens when you load `https://www.google.com`,
> layer by layer, including the "what if" questions and failure cases discussed.
> The project will grow chapter by chapter as the learning continues.

---

## 1. Goals

- **Visual first:** step-through animations, hover tooltips, and diagrams, not walls of text.
- **One running example:** a browser loading `https://www.google.com`, followed end to end.
- **Question-driven:** each chapter includes the real questions asked ("What if the server dies without sending FIN?") as expandable "Deep Dive" cards.
- **Easy to extend:** adding a new chapter means adding a content file, not rewriting components.
- **Publishable:** deploys free to GitHub Pages.

## 2. Recommended Stack

| Choice | Pick | Why |
|---|---|---|
| Framework | **React + TypeScript + Vite** | Component reuse across chapters, fast dev, static build |
| Animation | **Framer Motion** | Packet movement, step transitions |
| Diagrams | Custom **SVG components** (sequence diagram, layer stack, DNS tree) | Full control over hover/highlight |
| Tooltips | Radix UI Tooltip / Popover | Accessible hover + tap (works on mobile) |
| Styling | Tailwind CSS | Quick, consistent, dark mode |
| Content | One **TypeScript/JSON data file per chapter** | New chapters = new data, same components |
| Deploy | **GitHub Pages** via GitHub Actions | Free, public link |

## 3. Site Structure

```
/                    Landing: "Life of a Request" timeline overview (all stages as a clickable strip)
/dns                 Chapter 1: DNS
/tcp                 Chapter 2: TCP
/tls                 Chapter 3: TLS
/http                Chapter 4: HTTP (stub, to be expanded)
/auth                Chapter 5: Authentication (stub)
/beyond              Chapter 6: Load balancers, CDN, inside the data center (stub)
/glossary            Hoverable terms collected in one place
```

### Reusable components
- **`<RequestTimeline>`**: horizontal strip of all stages; current stage highlighted; click to jump.
- **`<SequenceDiagram>`**: client ↔ server lanes, animated arrows per message, a "Next / Prev / Play" stepper. Each arrow is hoverable and shows the flags and values (e.g. `SYN seq=100`).
- **`<LayerStack>`**: HTTP / TLS / TCP / IP stacked boxes; hovering a layer explains its job and dims the others.
- **`<DnsTree>`**: root → TLD → domain → subdomain tree with an animated resolver walking it.
- **`<WorldMap>`** (simple SVG): anycast demo showing two users hitting the same IP and landing on different nearby servers.
- **`<DeepDive>`**: expandable card titled with the real question asked.
- **`<WhatIfToggle>`**: switches a diagram into a failure scenario (e.g. "server crashed").
- **`<Term>`**: inline glossary word with a hover/tap tooltip.
- **`<Quiz>`** (optional): 3–5 check-yourself questions at the end of each chapter.

---

## 4. Chapter Content (from the conversation)

### Chapter 0: The Big Picture
Order of events when loading `https://www.google.com`:
1. **DNS** finds the IP address.
2. **TCP** opens a reliable connection (three-way handshake).
3. **IP routing** moves packets hop by hop through routers.
4. **TLS** encrypts the channel (HTTPS only).
5. **HTTP** carries the actual request and response.
6. *(stubs)* Load balancer / CDN → application → auth → response → render.

Layer analogy: **IP = the postal address; TCP = the guarantee the whole letter arrived intact; TLS = the sealed envelope; HTTP = the letter itself.**

### Chapter 1: DNS
**Core:**
- DNS = a distributed, hierarchical directory mapping names to IPs (IPv4 / IPv6). Not one phone book; thousands of servers.
- Read domains right to left: **root (.) → TLD (.com) → domain (google) → subdomain (www)**.
- Lookup walk: root says where .com is → .com says where google's name servers are → google's name servers return the IP.
- **Caching** at browser, OS, and ISP resolver; each record has a **TTL**. Most lookups never reach the root.
- **Record types:** A/AAAA (IP), CNAME (alias), MX (mail routing), TXT (domain ownership verification). DNS can also return different IPs for load distribution.
- **Who manages it:** ICANN (root and namespace) → Registry operator (e.g. Verisign runs .com) → Registrar (GoDaddy, Namecheap, Cloudflare) → domain owner (manages own records).

**Deep Dives (questions asked):**
- *"What if nothing is cached and the domain is brand new?"* — A new **domain** under an existing TLD: the registrar writes it into the TLD registry, which propagates (minutes to hours). You're adding a **leaf** to an existing branch.
- *"What if the TLD itself (.abc) doesn't exist?"* — Root servers don't know it; it can't resolve. A new **TLD** must be approved by ICANN and added to the root zone. You're adding a **branch**. (This is how .app, .dev, and .shop came to exist.)
- *"DNS servers are everywhere; how do I reach the nearest, and how do they stay the same?"* — **Anycast**: the same IP is announced from many locations, and routing delivers you to the nearest. Zone data is **replicated** so every location returns the same answer.

**Visuals:** animated DNS tree walk (cold cache vs. warm cache toggle), leaf-vs-branch demo, anycast world map.

### Chapter 2: TCP
**Three-way handshake (example numbers):**
1. Client → Server: `SYN, seq=100` ("I'd like to talk; my bytes start at 100")
2. Server → Client: `SYN-ACK, seq=500, ack=101` ("Got your 100, expecting 101; my side starts at 500")
3. Client → Server: `ACK, ack=501` ("Got your 500, expecting 501")

**Why three?** Each side needs proof that both directions work. After two messages, only the client knows; the third proves it to the server.

**Data transfer:**
- Data is split into numbered packets; the receiver ACKs what it gets.
- No ACK before timeout → retransmit.
- Sequence numbers allow reordering and gap detection.
- **Flow control:** the receiver advertises a window (buffer space), so a fast sender doesn't drown the receiver.
- **Congestion control:** back off when packets drop, so senders don't drown the network.
- The response flows back the same way, numbered from the server's starting count (500).
- **Teardown:** FIN → ACK from each side.

**Deep Dives:**
- *"Are connections short-lived?"* — Old model: one request per connection (handshake cost every time). Modern model: **keep-alive** reuses connections, which close after an idle timeout or on purpose.
- *"Do they send FIN after each request?"* — With keep-alive, they **deliberately don't send FIN**; that's what keeps it alive. FIN comes later, when one side is done or an **idle timeout** fires. Optional **keep-alive probes** check whether the other side still exists.
- *"What if the server crashed and never sent FIN, and I send on the idle connection?"* — A **half-open / stale connection**. The client sends, gets no ACK, retransmits with backoff, and may hang for a long time before erroring. Defenses: **app-level timeouts**, keep-alive probes, **retry on a fresh connection** (to a different server via a load balancer), **idempotency** so retries are safe, and **load balancer health checks**. This ties networking to the architect's "everything fails, design for it" mindset.

**Visuals:** sequence diagram stepper with hoverable flags; packet loss and retransmit animation; window size slider; **WhatIf toggle: "server crashed"** showing unanswered packets, retries with growing gaps, then timeout and a new connection.

### Chapter 3: TLS
**Handshake (after TCP):**
1. **ClientHello**: supported TLS versions, cipher suites, client random.
2. **ServerHello + Certificate**: chosen version and cipher, server random, certificate (public key + CA signature).
3. **Verify**: walk the chain to a trusted root, and confirm the server owns the private key.
4. **Key agreement**: both sides derive the *same* shared key from key-exchange material plus both randoms. The key never crosses the wire. **Forward secrecy**: recording the traffic doesn't reveal the key later.
5. **Switch to encrypted** → then the HTTP request goes out encrypted. Routers relay but can't read it.

Asymmetric crypto is used **only for the handshake**; data uses fast **symmetric** encryption.

**Deep Dives:**
- *"How can someone on another continent trust Google's certificate?"* — (1) **Signatures are unforgeable**: the CA signs with its private key, and anyone can verify with its public key. (2) **Trust anchors are preinstalled**: OS and browser ship root CA public keys. (3) **Chain of trust**: Google cert ← intermediate CA ← root CA. No live call to Google or the CA is needed.
- *"How does the client verify Google holds the private key?"* — The client never sees the private key. In modern TLS, the server **signs the handshake transcript** with its private key, and the client verifies with the certificate's public key. This also prevents replay. A copied certificate is useless without the private key. (Older approach: the client encrypts a secret with the public key, and only the private-key holder can decrypt it.)
- *"What are the random numbers for?"* — (1) Ingredients in the shared key, contributed by both sides. (2) **Freshness**: every session gets a unique key, so recorded handshakes can't be replayed.
- *"Is the TLS 'session' the same as TCP keep-alive?"* — No. TCP connection = the pipe (transport layer). TLS session = the agreed key and crypto state (security layer, on top). Usually one rides on the other, but **session resumption** lets a TLS session outlive its TCP connection and skip the full handshake on a new one.

**Visuals:** handshake stepper; certificate chain diagram (click each link to "verify"); "copycat attacker" scenario showing a copied certificate failing the signature check; side-by-side "router's view" (scrambled bytes) vs. "endpoints' view" (plain request); TCP pipe vs. TLS session layers with a resumption demo.

### Chapter 4: HTTP (stub, basics only; will be expanded)
- Request: method (GET/POST/…), path, headers (Host, User-Agent, Cookie, Authorization), body.
- Response: status code (2xx/3xx/4xx/5xx), headers (Content-Type, Cache-Control, Set-Cookie), body.
- HTTP/1.1 keep-alive vs. HTTP/2 multiplexing vs. HTTP/3 (QUIC over UDP).
- Visual: hoverable request/response anatomy.

### Chapter 5: Authentication (stub; next topic to discuss)
- Transport security (TLS) vs. identity (who you are).
- Sessions and cookies; tokens (JWT); OAuth 2.0 / OpenID Connect flow.
- Public edge services vs. private internal services (VPC, API gateway, service-to-service auth such as mTLS).

### Chapter 6: Beyond the Front Door (stub)
- CDN edge → load balancer → API gateway / BFF → internal services → database → response back.
- Visual: the request entering a data center, with public vs. private zones shaded.

---

## 5. Interaction Features Checklist
- [ ] Clickable stage timeline on every page
- [ ] Step / Play / Pause / Reset controls on every diagram
- [ ] Hover (desktop) and tap (mobile) tooltips on every arrow, flag, and term
- [ ] "What If" failure toggles (crashed server, cold DNS cache, copycat certificate)
- [ ] Deep Dive cards using the original question wording
- [ ] Glossary page generated from `<Term>` usages
- [ ] Dark mode and a mobile-friendly layout
- [ ] Optional per-chapter quiz

## 6. Build Plan (phased)
1. **Scaffold:** Vite + React + TS + Tailwind + Framer Motion; GitHub Pages deploy workflow; routing; chapter data schema.
2. **Core components:** RequestTimeline, SequenceDiagram (stepper), DeepDive, Term/Tooltip, LayerStack.
3. **Chapter 0 + Chapter 2 (TCP):** proves the sequence diagram and WhatIf pattern.
4. **Chapter 1 (DNS):** DnsTree + anycast map.
5. **Chapter 3 (TLS):** handshake, certificate chain, attacker scenario.
6. **Stubs:** HTTP, Auth, Beyond, each marked "coming soon / basics".
7. **Polish:** glossary, mobile pass, README with screenshots and live link.

## 7. How to Add Future Chapters
Each chapter lives at `src/content/<chapter>.ts` exporting `{ id, title, summary, steps[], deepDives[], whatIfs[], glossary[] }`.
Adding a topic = new content file + a route entry. Components stay unchanged.

## 8. Conventions
- Keep the **google.com** example consistent across all chapters (same seq numbers 100/500).
- Mark simplifications honestly (e.g. "simplified: real TLS 1.3 merges some of these steps").
- Plain, friendly language; the audience is developers moving toward system design.
