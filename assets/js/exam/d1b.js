/* Exam drill bank, Domain 1 "twins": the same key ideas asked a different way. Format: see d1.js. */
(window.NP_EXAM = window.NP_EXAM || { mc: [], pbq: [] }).mc.push(
{
  id: "t1-01", o: "1.1",
  q: "A device examines the destination IP address of each incoming packet and chooses the best path to forward it toward a remote network. At which OSI layer does this decision happen?",
  c: ["Layer 2", "Layer 3", "Layer 4", "Layer 7"],
  a: 1,
  why: "Choosing a path using <b>IP addresses</b> is <b>routing</b>, which happens at <b>Layer 3 (Network)</b>.",
  no: ["Layer 2 forwards <b>frames</b> by <b>MAC</b> address inside one network (switches).", "", "Layer 4 handles ports and reliability (TCP/UDP), not path selection.", "Layer 7 is the application interface (HTTP, DNS)."],
  clue: "<b>Switch = 2 (MAC). Router = 3 (IP).</b> 'Router' and 'Three' both have an R.",
  trig: "'IP address', 'route', 'path', 'packet', 'router' → <b>Layer 3</b>."
},
{
  id: "t1-02", o: "1.1",
  q: "Which OSI layer is responsible for establishing, maintaining and tearing down the dialog between two applications, such as keeping a remote procedure call (RPC) conversation open?",
  c: ["Transport", "Session", "Presentation", "Network"],
  a: 1,
  why: "<b>Layer 5 (Session)</b> opens, manages and closes <b>conversations</b> between applications.",
  no: ["Transport does end-to-end delivery with ports, segmentation and reliability. It moves the data but doesn't manage the app's dialog.", "", "Presentation formats, encrypts and compresses data.", "Network does logical addressing and routing."],
  clue: "<b>Session = a phone call</b>: dial, talk, hang up.",
  trig: "'Establish/maintain/terminate the dialog', 'RPC', 'session' → <b>Layer 5</b>."
},
{
  id: "t1-03", o: "1.1",
  q: "Which sequence correctly lists the protocol data units (PDUs) as data is encapsulated from the application down to the wire?",
  c: ["Bits → Frames → Packets → Segments → Data", "Data → Segments → Packets → Frames → Bits", "Data → Packets → Segments → Frames → Bits", "Data → Frames → Packets → Segments → Bits"],
  a: 1,
  why: "Going <b>down</b> the stack: L7–5 <b>Data</b> → L4 <b>Segment</b> → L3 <b>Packet</b> → L2 <b>Frame</b> → L1 <b>Bits</b>.",
  no: ["That's the order going <b>up</b> the stack (decapsulation), backwards from what's asked.", "", "Packets and segments are swapped. Transport (segment) comes before Network (packet) going down.", "Frames are Layer 2 and can't come right after data."],
  clue: "<b>'Do Some People Fear Birthdays?'</b> Data, Segment, Packet, Frame, Bits.",
  trig: "'Encapsulation order' → <b>D-S-P-F-B</b>. 'Decapsulation' → reverse it."
},
{
  id: "t1-04", o: "1.2",
  q: "A sensor receives a copy of traffic from a switch's SPAN port, compares it to attack signatures, and emails an alert when it finds a match. It cannot stop the traffic. What is this device?",
  c: ["IPS", "IDS", "Next-generation firewall", "Load balancer"],
  a: 1,
  why: "It sees a <b>copy</b> (out of band) and only <b>alerts</b>, so it's an <b>IDS</b>.",
  no: ["An IPS sits <b>inline</b> and can drop malicious traffic. This device can't stop anything.", "", "An NGFW is an inline enforcement device that blocks traffic.", "A load balancer distributes traffic to servers."],
  clue: "<b>IDS = Detects (a smoke alarm). IPS = Prevents (a sprinkler).</b> A copy from SPAN means it can only watch.",
  trig: "'Copy of traffic', 'SPAN/TAP', 'alerts only', 'passive' → <b>IDS</b>. 'Inline', 'blocks' → <b>IPS</b>."
},
{
  id: "t1-05", o: "1.2",
  q: "A company places a server in front of its internal web servers. Internet clients connect to it, it caches responses, terminates TLS, and hides the identities of the servers behind it. What is it?",
  c: ["Forward proxy", "Reverse proxy", "NAT gateway", "Content filter"],
  a: 1,
  why: "A <b>reverse proxy</b> stands in front of <b>servers</b> for inbound clients: it caches, offloads TLS and hides the back end.",
  no: ["A forward proxy stands in front of <b>internal users</b> going <b>out</b> to the internet, for filtering and caching their browsing.", "", "A NAT gateway lets private cloud instances reach the internet outbound. It doesn't cache or terminate TLS.", "A content filter blocks categories for users."],
  clue: "<b>Forward proxy protects the clients. Reverse proxy protects the servers.</b>",
  trig: "'In front of web servers', 'inbound', 'hides servers' → <b>reverse proxy</b>. 'Users' browsing', 'outbound' → <b>forward proxy</b>."
},
{
  id: "t1-06", o: "1.2",
  q: "Database servers need high-performance block-level storage over a dedicated network, and the storage should appear to each server as a local disk. Which solution fits?",
  c: ["NAS", "SAN", "CDN", "Cloud file share"],
  a: 1,
  why: "A <b>SAN</b> delivers <b>block-level</b> storage over its own network (Fibre Channel or iSCSI). Servers see LUNs as local disks.",
  no: ["A NAS gives <b>file-level</b> shares (SMB/NFS) over the normal LAN.", "", "A CDN caches content for internet users.", "A file share is file-level, not block-level."],
  clue: "<b>SAN = Blocks on a Separate network. NAS = Files on the LAN.</b>",
  trig: "'Block-level', 'appears as local disk', 'Fibre Channel/iSCSI' → <b>SAN</b>."
},
{
  id: "t1-07", o: "1.3",
  q: "A company rents virtual machines from a cloud provider. The company installs and patches the operating systems and applications itself; the provider handles the hardware. Which service model is this?",
  c: ["SaaS", "PaaS", "IaaS", "DaaS"],
  a: 2,
  why: "<b>IaaS</b>: the provider gives you raw infrastructure (compute, storage, network). <b>You</b> manage the OS and everything above it.",
  no: ["SaaS is a finished app (webmail, CRM). You manage nothing but your data.", "PaaS gives you a platform to deploy code on. The provider manages the OS and runtime.", "", "DaaS is Desktop as a Service, virtual desktops for users."],
  clue: "Who patches the OS? <b>You → IaaS. Provider → PaaS/SaaS.</b> IaaS = 'I manage almost all of it'.",
  trig: "'Rent VMs', 'we manage the OS' → <b>IaaS</b>. 'Just deploy code' → <b>PaaS</b>. 'Use the app' → <b>SaaS</b>."
},
{
  id: "t1-08", o: "1.3",
  q: "Several unrelated customers' virtual servers run on the same physical hosts at a cloud provider, but each customer's data and network are logically isolated. What is this characteristic called?",
  c: ["Elasticity", "Multitenancy", "Hybrid cloud", "Scalability"],
  a: 1,
  why: "<b>Multitenancy</b>: many tenants (customers) share the same physical resources, with logical separation between them.",
  no: ["Elasticity is automatically growing and shrinking resources with demand.", "", "Hybrid mixes on-prem/private with public cloud.", "Scalability is the ability to grow to handle more load."],
  clue: "<b>Multitenancy = an apartment building.</b> One building, many tenants, each behind a locked door.",
  trig: "'Shared physical hardware', 'many customers', 'logically isolated' → <b>multitenancy</b>."
},
{
  id: "t1-09", o: "1.3",
  q: "Instances in a cloud subnet host a public website and must be directly reachable from the internet, with two-way traffic. What must the VPC have, with a route to it?",
  c: ["NAT gateway", "Internet gateway", "VPC peering connection", "Direct Connect"],
  a: 1,
  why: "An <b>internet gateway</b> gives a VPC <b>two-way</b> internet access. Subnets with a route to it are 'public subnets'.",
  no: ["A NAT gateway is <b>outbound only</b>. Private instances can reach the internet, but the internet can't start connections to them.", "", "VPC peering connects two VPCs privately. It's not internet.", "Direct Connect is a private circuit to your data center. It's not internet."],
  clue: "<b>Internet gateway = a front door (in and out). NAT gateway = a one-way exit.</b>",
  trig: "'Public subnet', 'reachable from internet' → <b>internet gateway</b>. 'Private subnet, outbound updates only' → <b>NAT gateway</b>."
},
{
  id: "t1-10", o: "1.3",
  q: "An online ticket site automatically adds web servers when a concert goes on sale and removes them an hour later when demand drops, so it pays only for what it uses. Which cloud concept is this?",
  c: ["Elasticity", "Multitenancy", "Vertical scaling only", "Community cloud"],
  a: 0,
  why: "<b>Elasticity</b> means <b>automatically</b> adding <b>and removing</b> resources as demand changes. The 'shrink back down' part is the key word.",
  no: ["", "Multitenancy is sharing hardware among customers.", "Vertical scaling makes one server bigger, and doing it by hand isn't automatic up-and-down.", "Community cloud is shared by organizations with common needs."],
  clue: "<b>Elastic = a rubber band.</b> It stretches and snaps back on its own.",
  trig: "'Automatically add AND remove', 'pay for what you use', 'demand spikes' → <b>elasticity</b>."
},
{
  id: "t1-11", o: "1.4",
  q: "Two corporate mail servers relay email to each other across the internet using unencrypted SMTP. Which port does this use?",
  c: ["25", "110", "143", "587"],
  a: 0,
  why: "Server-to-server mail relay uses <b>SMTP on TCP 25</b>.",
  no: ["", "110 is POP3, where a client downloads mail.", "143 is IMAP, where a client reads mail on the server.", "587 is mail <b>submission</b> from clients with TLS. CompTIA's list calls this 'SMTPS'."],
  clue: "<b>SMTP 25 = 'Send Mail To People' at 25 cents.</b> Secure submission = 587.",
  trig: "'Server-to-server relay', 'SMTP' → <b>25</b>. 'Secure SMTP / submission' → <b>587</b>."
},
{
  id: "t1-12", o: "1.4",
  q: "A switch detects that its power supply failed and immediately sends an unsolicited alert to the network management station. Which message type and port is this?",
  c: ["SNMP Get on UDP 161", "SNMP Trap on UDP 162", "Syslog on UDP 514", "NTP on UDP 123"],
  a: 1,
  why: "An <b>unsolicited SNMP alert</b> from the device to the NMS is a <b>trap</b>, sent to <b>UDP 162</b>.",
  no: ["A Get is the NMS <b>asking</b> (polling) the device, on UDP 161. Here nobody asked.", "", "Syslog is close, but the question says SNMP-style alert to the NMS. Syslog sends log messages to a log collector.", "NTP syncs time."],
  clue: "<b>161 = the NMS asks. 162 = the device yells.</b> One more = the reply nobody asked for.",
  trig: "'Unsolicited', 'device alerts NMS', 'trap' → <b>162</b>. 'Poll', 'query' → <b>161</b>."
},
{
  id: "t1-13", o: "1.4",
  q: "A VoIP system sends voice traffic using a transport protocol that does NOT retransmit lost packets, because a late packet is useless in a live call. Which protocol, and why is it preferred?",
  c: ["TCP, because it guarantees delivery", "UDP, because it has low overhead and no retransmission delays", "TCP, because it uses a three-way handshake", "ICMP, because it is connectionless"],
  a: 1,
  why: "<b>UDP</b> is connectionless with low overhead. Real-time voice and video would rather <b>drop</b> a packet than wait for a retransmission.",
  no: ["Guaranteed delivery means retransmissions, which add delay and jitter. That's bad for live voice.", "", "The handshake adds setup overhead and doesn't help real-time media.", "ICMP carries diagnostics (ping), not voice."],
  clue: "<b>TCP = registered mail (signed for, resent if lost). UDP = live TV (if you miss it, it's gone).</b>",
  trig: "'Real-time', 'streaming', 'VoIP', 'low overhead' → <b>UDP</b>. 'Reliable', 'acknowledged', 'ordered' → <b>TCP</b>."
},
{
  id: "t1-14", o: "1.4",
  q: "A PC sends an ARP request to the destination MAC address FF:FF:FF:FF:FF:FF so every device on the local network receives it. What type of traffic is this?",
  c: ["Unicast", "Multicast", "Anycast", "Broadcast"],
  a: 3,
  why: "All F's is the <b>broadcast</b> MAC. Every host in the broadcast domain receives and processes it. ARP requests are the classic example.",
  no: ["Unicast goes to one specific MAC.", "Multicast MACs start with 01:00:5E and go to a group, not to everyone.", "Anycast is an IP-level concept where the nearest of many servers answers.", ""],
  clue: "<b>All F's = 'For everyone'.</b> Routers stop broadcasts, so a router marks the edge of a broadcast domain.",
  trig: "'FF:FF:FF:FF:FF:FF', '255.255.255.255', 'ARP request', 'DHCP Discover' → <b>broadcast</b>."
},
{
  id: "t1-15", o: "1.5",
  q: "A carrier needs a 40 km fiber run between two cities. Which media is required?",
  c: ["OM4 multimode fiber", "Single-mode fiber", "Cat8 copper", "RG-6 coax"],
  a: 1,
  why: "<b>Single-mode</b> fiber has a tiny core and is driven by a <b>laser</b>, so light travels in one path with very little dispersion. That's what lets it run <b>tens of kilometers</b>.",
  no: ["Multimode, even OM4, reaches only a few hundred meters at high speed. Its wide core lets many light paths spread the signal out.", "", "Cat8 is about 30 m, for the data center only.", "Coax is for cable TV and internet distribution and can't do 40 km at backbone speed."],
  clue: "<b>Single-mode = Single path = Super long.</b> Multimode = many paths = short.",
  trig: "'Kilometers', 'between cities/campuses', 'laser' → <b>single-mode</b>. 'Within a building', 'LED/VCSEL', 'cheaper' → <b>multimode</b>."
},
{
  id: "t1-16", o: "1.5",
  q: "A core switch needs a 40 Gbps uplink module. Which transceiver form factor is used for 40G?",
  c: ["SFP", "SFP+", "QSFP+", "GBIC"],
  a: 2,
  why: "<b>QSFP+</b> (Quad SFP+) bundles four 10G lanes into <b>40G</b>. QSFP28 does 100G.",
  no: ["SFP is the 1 Gbps form factor.", "SFP+ is 10 Gbps.", "", "GBIC is the old, large 1G module."],
  clue: "<b>Q = Quad = 4 × 10G = 40G.</b> SFP 1G → SFP+ 10G → QSFP+ 40G → QSFP28 100G.",
  trig: "'40G' → <b>QSFP+</b>. '10G' → <b>SFP+</b>. '1G' → <b>SFP</b>."
},
{
  id: "t1-17", o: "1.5",
  q: "Which 802.11 standard is marketed as Wi-Fi 5 and operates only in the 5 GHz band?",
  c: ["802.11n", "802.11ac", "802.11ax", "802.11g"],
  a: 1,
  why: "<b>802.11ac = Wi-Fi 5</b>, 5 GHz only, with wider channels and MU-MIMO (downlink).",
  no: ["802.11n is Wi-Fi 4 and runs on both 2.4 and 5 GHz.", "", "802.11ax is Wi-Fi 6/6E, on 2.4, 5 and 6 GHz.", "802.11g is 2.4 GHz only, 54 Mbps."],
  clue: "Wi-Fi numbers: <b>n = 4, ac = 5, ax = 6.</b> 'AC' has a 'C' for 'Can only do 5'.",
  trig: "'Wi-Fi 5', '5 GHz only' → <b>802.11ac</b>. 'Wi-Fi 6', 'OFDMA' → <b>802.11ax</b>."
},
{
  id: "t1-18", o: "1.6",
  q: "A small campus combines the core and distribution layers into one pair of switches to save cost, while access switches connect up to them. What is this design called?",
  c: ["Spine and leaf", "Collapsed core", "Full mesh", "Hub and spoke"],
  a: 1,
  why: "A <b>collapsed core</b> (two-tier) merges <b>core + distribution</b> into one layer. It's common in smaller networks.",
  no: ["Spine and leaf is a data-center design where every leaf connects to every spine.", "", "Full mesh links every device to every other device.", "Hub and spoke is a WAN design with branches linked to a central site."],
  clue: "<b>Collapsed = three tiers squashed into two.</b>",
  trig: "'Core and distribution combined', 'two-tier', 'small campus' → <b>collapsed core</b>."
},
{
  id: "t1-19", o: "1.6",
  q: "An architect wants every one of 5 branch sites directly connected to every other site for maximum redundancy. How many WAN links are needed?",
  c: ["5", "10", "20", "25"],
  a: 1,
  why: "Full mesh links = <b>n(n − 1) / 2</b> = 5 × 4 / 2 = <b>10</b>.",
  no: ["5 is just the number of sites. That would only be a ring.", "", "20 is n(n − 1), which counts every link twice.", "25 is n², which isn't a mesh formula."],
  clue: "<b>Full mesh = n(n−1)/2.</b> Everyone shakes hands with everyone once.",
  trig: "'Full mesh', 'how many links' → <b>n(n−1)/2</b>. 6 sites = 15, 8 sites = 28."
},
{
  id: "t1-20", o: "1.7",
  q: "A point-to-point WAN link between two routers needs exactly two usable IP addresses with the least waste (traditional subnetting). Which prefix should be used?",
  c: ["/28", "/29", "/30", "/24"],
  a: 2,
  why: "A <b>/30</b> has 4 addresses: network, 2 hosts, broadcast. That's exactly <b>2 usable</b>, the classic point-to-point mask.",
  no: ["/28 has 14 usable addresses, which wastes 12.", "/29 has 6 usable, which wastes 4.", "", "/24 has 254 usable, a huge waste."],
  clue: "<b>/30 = 'two-for-the-link'.</b> (/31 also works on point-to-point links per RFC 3021, but /30 is the classic answer.)",
  trig: "'Point-to-point', '2 hosts', 'router-to-router' → <b>/30</b> (255.255.255.252)."
},
{
  id: "t1-21", o: "1.7",
  q: "Which of the following IP addresses is NOT in an RFC 1918 private range?",
  c: ["10.255.1.1", "172.32.0.5", "192.168.255.1", "172.31.200.1"],
  a: 1,
  why: "The private 172 range is only <b>172.16.0.0 – 172.31.255.255</b> (172.16.0.0/12). <b>172.32</b> is just outside it, so it's public.",
  no: ["10.0.0.0/8 covers everything 10.x.x.x, so it's private.", "", "192.168.0.0/16 covers 192.168.x.x, so it's private.", "172.31 is the <b>last</b> second octet inside the private 172 range, so it's private."],
  clue: "<b>10 / 172.16–31 / 192.168.</b> For 172, think '16 to 31'. 32 is out.",
  trig: "Private ranges: <b>10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16</b>. Watch for 172.15 and 172.32 traps."
},
{
  id: "t1-22", o: "1.7",
  q: "A router has routes to 192.168.0.0/24, 192.168.1.0/24, 192.168.2.0/24 and 192.168.3.0/24. Which single summary route covers exactly these four networks?",
  c: ["192.168.0.0/16", "192.168.0.0/22", "192.168.0.0/23", "192.168.0.0/21"],
  a: 1,
  why: "Four /24s = 2² networks, so borrow back <b>2 bits</b>: /24 − 2 = <b>/22</b>. 192.168.0.0/22 spans .0.0 to .3.255. Exactly the four.",
  no: ["/16 covers 256 networks, far too broad.", "", "/23 covers only 2 networks (.0 and .1).", "/21 covers 8 networks (.0 to .7), which is too broad."],
  clue: "<b>Summary: count the networks (must be a power of 2), take log₂, and subtract from the prefix.</b> 4 → 2 bits → /22.",
  trig: "'Summarize', 'supernet', 'single route for' → find the shortest prefix that covers <b>exactly</b> the block."
},
{
  id: "t1-23", o: "1.8",
  q: "An engineer needs IPv6 addresses for internal use only, similar to IPv4 private ranges, that will never be routed on the internet. Which address type should be used?",
  c: ["Global unicast (2000::/3)", "Link-local (fe80::/10)", "Unique local (fc00::/7, usually fd00::/8)", "Multicast (ff00::/8)"],
  a: 2,
  why: "<b>Unique local addresses (ULA)</b>, fc00::/7 (in practice fd00::/8), are IPv6's version of <b>private</b> addresses. They're routable inside the organization but not on the internet.",
  no: ["Global unicast addresses are public and internet-routable.", "Link-local addresses only work on <b>one link</b>. They can't be routed even internally.", "", "Multicast addresses are for groups, not for interface addressing."],
  clue: "<b>fd = 'for domestic' use (private). fe80 = 'this wire only'. 2000 = global.</b>",
  trig: "'IPv6 private equivalent', 'internal only, routable inside' → <b>unique local (fd00::)</b>. 'Single link only' → <b>link-local fe80</b>."
},
{
  id: "t1-24", o: "1.8",
  q: "A network team writes all switch and firewall configurations as code templates stored in a repository and deploys them with automation tools, so every deployment is repeatable. What practice is this?",
  c: ["Infrastructure as code (IaC)", "Network function virtualization", "Software-defined WAN", "Zero trust architecture"],
  a: 0,
  why: "<b>IaC</b> defines infrastructure in <b>code files</b> (templates, playbooks) that are version-controlled and deployed automatically. It's repeatable and prevents drift.",
  no: ["", "NFV runs network functions as VMs instead of hardware appliances.", "SD-WAN manages WAN links centrally and steers traffic by policy.", "Zero trust is a security model ('never trust, always verify')."],
  clue: "<b>IaC = the network as a recipe.</b> Same recipe, same result every time.",
  trig: "'Templates', 'playbooks', 'version control', 'automation', 'repeatable', 'drift' → <b>IaC</b>."
},
{
  id: "t1-25", o: "1.8",
  q: "A company drops the idea of a trusted internal network. Every access request, even from inside headquarters, must be authenticated, authorized and continuously verified with least privilege. What model is this?",
  c: ["Defense in depth", "Zero trust architecture", "Screened subnet", "Perimeter security"],
  a: 1,
  why: "<b>Zero trust</b>: 'never trust, always verify'. Being on the inside earns no trust. Every request is checked using identity, device posture and policy.",
  no: ["Defense in depth is layering many controls. It's related but not the same as removing implicit trust.", "", "A screened subnet (DMZ) is a network zone for public servers.", "Perimeter security trusts the inside, which is exactly what this model rejects."],
  clue: "<b>Zero trust = zero free passes.</b> Even the CEO's laptop at HQ gets checked.",
  trig: "'Never trust, always verify', 'no implicit trust inside', 'continuous verification' → <b>zero trust</b>."
}
);
