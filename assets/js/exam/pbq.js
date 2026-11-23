/* Exam drill bank: performance-based questions (PBQs).
   type "order": items listed in the CORRECT order (shuffled on screen); each item {t, why}.
   type "match": rows {label, a, why, options?}; shared q.options unless a row has its own.
   Optional: answer (summary line), no (common traps), clue, trig. */
(window.NP_EXAM = window.NP_EXAM || { mc: [], pbq: [] }).pbq.push(
{
  id: "p-01", o: "5.1", type: "order",
  title: "Troubleshooting methodology",
  setup: "<p>Users on the 3rd floor report they can't reach the file server. You've been assigned the ticket.</p>",
  prompt: "Put the CompTIA troubleshooting steps in the correct order (1 = first).",
  items: [
    { t: "Identify the problem (gather info, question users, determine what changed, duplicate the problem)", why: "Always first. You can't fix what you haven't defined. Ask what changed: 'it worked yesterday' is gold." },
    { t: "Establish a theory of probable cause (question the obvious, consider multiple approaches)", why: "Make an educated guess. Use top-down or bottom-up OSI, or divide and conquer." },
    { t: "Test the theory to determine the cause", why: "Confirmed → plan. Not confirmed → new theory or escalate." },
    { t: "Establish a plan of action to resolve the problem and identify potential effects", why: "Think about downtime, change approval and the rollback plan <i>before</i> touching anything." },
    { t: "Implement the solution or escalate as necessary", why: "Carry out the plan, or hand off if it's beyond your access or skill." },
    { t: "Verify full system functionality and implement preventive measures", why: "Confirm users can actually work, and stop the problem from recurring." },
    { t: "Document findings, actions, outcomes and lessons learned", why: "Always last, so the next person doesn't start from zero." }
  ],
  clue: "<b>'I Think That People In Vegas Dance'</b>: Identify, Theory, Test, Plan, Implement, Verify, Document.",
  trig: "'FIRST' → identify. 'Theory confirmed, NEXT' → plan. 'After the fix' → verify. 'LAST' → document.",
  no: "The usual traps: putting <b>test</b> before <b>theory</b>, and putting <b>document</b> anywhere but last. 'Implement' comes only after a plan."
},
{
  id: "p-02", o: "1.4", type: "match",
  title: "Ports and protocols",
  setup: "<p>You are building firewall rules for a new office. Match each service to its well-known port.</p>",
  prompt: "Select the port for each protocol.",
  options: ["20/21", "22", "23", "25", "53", "67/68", "69", "123", "161/162", "389", "443", "445", "514", "587", "636", "1433", "3389", "5060/5061"],
  rows: [
    { label: "SSH / SFTP", a: "22", why: "Secure shell. SFTP rides inside SSH, so it shares 22." },
    { label: "DNS", a: "53", why: "UDP 53 for queries, TCP 53 for zone transfers and large replies." },
    { label: "DHCP", a: "67/68", why: "Server listens on 67, client on 68 (UDP)." },
    { label: "NTP", a: "123", why: "UDP 123. 'One-two-three, what time is it?'" },
    { label: "SNMP (polling / traps)", a: "161/162", why: "161 = the NMS polls the device. 162 = the device sends traps to the NMS." },
    { label: "LDAPS", a: "636", why: "LDAP is 389. Secure LDAP gets its own port, 636." },
    { label: "SMB (Windows file sharing)", a: "445", why: "Server Message Block on TCP 445." },
    { label: "Syslog", a: "514", why: "UDP 514, central log collection." },
    { label: "SMTP with secure submission (CompTIA's 'SMTPS')", a: "587", why: "CompTIA's N10-009 list maps SMTPS to <b>587</b>. Plain SMTP relay is 25." },
    { label: "RDP", a: "3389", why: "Windows Remote Desktop, TCP 3389." },
    { label: "Microsoft SQL Server", a: "1433", why: "TCP 1433." },
    { label: "TFTP", a: "69", why: "UDP 69, no authentication. Used for firmware and phone configs." }
  ],
  clue: "Chunk them: <b>20-21-22-23-25</b> (FTP, SSH, Telnet, SMTP) · <b>53-67-68-69</b> (DNS, DHCP, TFTP) · <b>123-161-162</b> (NTP, SNMP) · <b>389 → 636</b> (LDAP → LDAPS) · <b>443-445</b> (HTTPS, SMB) · <b>514, 587</b> · <b>1433, 3389, 5060/5061</b>.",
  trig: "On port questions, watch for the <b>secure version</b> twist: LDAP 389 → LDAPS 636, SIP 5060 → 5061, SMTP 25 → 587, HTTP 80 → 443, Telnet 23 → SSH 22."
},
{
  id: "p-03", o: "4.3", type: "match",
  title: "Firewall rules for a screened subnet",
  setup: `<p>A web server (203.0.113.10) sits in the screened subnet (DMZ). Requirements:</p>
<ul><li>Internet users reach the website securely.</li><li>Admins manage the server with an encrypted CLI.</li><li>The server resolves names using the internal DNS server.</li><li>The server keeps accurate time for its logs.</li><li>Clear-text remote management must be explicitly blocked.</li><li>Everything else is blocked.</li></ul>`,
  prompt: "Choose the correct rule for each line of the firewall policy.",
  options: ["PERMIT TCP 443", "PERMIT TCP 80", "PERMIT TCP 22", "PERMIT TCP 23", "DENY TCP 23", "PERMIT UDP 53", "PERMIT UDP 123", "PERMIT UDP 161", "DENY ANY ANY", "PERMIT ANY ANY"],
  rows: [
    { label: "Rule 1: Internet → web server, secure website", a: "PERMIT TCP 443", why: "'Securely' = HTTPS = TCP 443. Port 80 is plain HTTP." },
    { label: "Rule 2: Admin subnet → web server, encrypted CLI", a: "PERMIT TCP 22", why: "Encrypted CLI = SSH = TCP 22." },
    { label: "Rule 3: Web server → internal DNS server", a: "PERMIT UDP 53", why: "DNS queries use UDP 53." },
    { label: "Rule 4: Web server → NTP server", a: "PERMIT UDP 123", why: "Accurate log time = NTP = UDP 123." },
    { label: "Rule 5: Any → web server, clear-text management", a: "DENY TCP 23", why: "Telnet (23) is clear text. The requirement says block it explicitly." },
    { label: "Rule 6: Last rule", a: "DENY ANY ANY", why: "The explicit deny-all at the bottom. Firewalls read top-down, first match wins, so the deny goes last or it would block everything above it." }
  ],
  answer: "443 → 22 → UDP 53 → UDP 123 → deny 23 → deny any any (always last).",
  no: "Traps: picking <b>80</b> for 'secure', <b>permitting 23</b> for management, putting <b>DENY ANY ANY</b> at the top (that would block everything), or <b>PERMIT ANY ANY</b> at the bottom (that defeats the policy).",
  clue: "<b>Specific permits at the top, deny-all at the bottom.</b> Firewalls read top-down and stop at the first match.",
  trig: "On ACL/firewall PBQs, map each requirement to a <b>protocol + port</b>, then check the <b>order</b>. The implicit or explicit deny always comes last."
},
{
  id: "p-04", o: "1.5", type: "match",
  title: "Choose the right cable, connector or transceiver",
  setup: "<p>You're the cabling lead on a building project. Pick the best media for each job.</p>",
  prompt: "Select the BEST option for each requirement.",
  options: ["Cat5e UTP", "Cat6a UTP", "Plenum-rated cable", "DAC (twinax)", "Multimode fiber + 10GBASE-SR", "Single-mode fiber + 10GBASE-LR", "MPO/MTP trunk", "RG-6 coax with F-type connector", "STP cable"],
  rows: [
    { label: "Desk drop of 95 m that must run 10 Gbps", a: "Cat6a UTP", why: "Cat6a supports 10GBASE-T for the full 100 m. Cat6 only reaches about 55 m at 10G." },
    { label: "Two top-of-rack switches 3 m apart, 10G, cheapest", a: "DAC (twinax)", why: "A direct attach copper cable has transceivers built in. It's cheap and short (a few meters)." },
    { label: "10G link between floors, 250 m", a: "Multimode fiber + 10GBASE-SR", why: "SR on OM3 multimode reaches about 300 m and is cheaper than single-mode optics." },
    { label: "10G link between buildings 8 km apart", a: "Single-mode fiber + 10GBASE-LR", why: "LR on single-mode reaches about 10 km. Multimode can't go that far." },
    { label: "Cable through the air-handling space above a drop ceiling", a: "Plenum-rated cable", why: "Fire code: plenum jackets give off less toxic smoke in air-return spaces." },
    { label: "High-density 40G/100G backbone using 12 fibers in one connector", a: "MPO/MTP trunk", why: "MPO packs 12 or 24 fibers into one connector for parallel optics." },
    { label: "Cable modem connection from the ISP's wall outlet", a: "RG-6 coax with F-type connector", why: "Cable internet uses RG-6 coax with screw-on F-type connectors." },
    { label: "Copper run next to heavy factory motors", a: "STP cable", why: "Shielding protects copper from EMI (fiber would also work)." }
  ],
  clue: "<b>Distance ladder:</b> DAC (meters) → copper (100 m) → multimode/SR (hundreds of m) → single-mode/LR (km).",
  trig: "Read the <b>distance and speed</b> first, then the <b>environment</b> (plenum, EMI). Pick the cheapest option that meets the requirement."
},
{
  id: "p-05", o: "4.2", type: "match",
  title: "Match the attack to the mitigation",
  setup: "<p>Your security audit found evidence of each attack below. Assign the control that BEST stops each one.</p>",
  prompt: "Select the best mitigation for each attack.",
  options: ["Dynamic ARP inspection", "DHCP snooping", "Port security (MAC limit)", "Change native VLAN to an unused VLAN", "BPDU guard", "DNSSEC", "Wireless IDS / rogue AP detection", "Access control vestibule", "Disable DTP / set ports to access mode"],
  rows: [
    { label: "ARP poisoning: fake gateway MAC", a: "Dynamic ARP inspection", why: "DAI checks ARP replies against the DHCP snooping table and drops forged ones." },
    { label: "Rogue DHCP server handing out a bad gateway", a: "DHCP snooping", why: "Only 'trusted' ports (toward the real server) may send DHCP offers. Others are blocked." },
    { label: "MAC flooding: thousands of fake source MACs", a: "Port security (MAC limit)", why: "Limiting MACs per port stops the CAM table from filling up." },
    { label: "Double-tagging VLAN hopping", a: "Change native VLAN to an unused VLAN", why: "Double tagging abuses the native VLAN. Make it an unused VLAN and tag everything." },
    { label: "Switch spoofing: host negotiates a trunk", a: "Disable DTP / set ports to access mode", why: "With trunk negotiation off, a host can't become a trunk." },
    { label: "User plugs in a home switch and STP topology changes", a: "BPDU guard", why: "Access ports that receive BPDUs get err-disabled." },
    { label: "DNS cache poisoning", a: "DNSSEC", why: "Signed records let resolvers reject forged answers." },
    { label: "Evil twin AP copying the corporate SSID", a: "Wireless IDS / rogue AP detection", why: "A WIDS/WIPS spots unauthorized APs broadcasting your SSID (802.1X with certificate validation also helps)." },
    { label: "Tailgating through the badge door", a: "Access control vestibule", why: "A mantrap or vestibule lets only one person through per badge." }
  ],
  clue: "Layer 2 defenses come in pairs: <b>DHCP snooping ↔ rogue DHCP</b>, <b>DAI ↔ ARP</b>, <b>port security ↔ MAC flooding</b>, <b>BPDU guard ↔ rogue switch</b>.",
  trig: "If the attack name contains the protocol, the fix usually does too: <b>ARP → ARP inspection, DHCP → DHCP snooping, DNS → DNSSEC</b>."
},
{
  id: "p-06", o: "5.3", type: "match",
  title: "Diagnose the workstations",
  setup: `<p>The network is <b>192.168.10.0/24</b>. Gateway <b>192.168.10.1</b>, DNS server <b>192.168.10.10</b>, DHCP is enabled. Five users report problems. Here is <code>ipconfig</code> from each PC:</p>
<pre>PC-A  IPv4 169.254.12.7    Mask 255.255.0.0      Gateway (blank)        DNS (blank)
PC-B  IPv4 192.168.10.45   Mask 255.255.255.0    Gateway 192.168.20.1   DNS 192.168.10.10
PC-C  IPv4 192.168.10.46   Mask 255.255.255.252  Gateway 192.168.10.1   DNS 192.168.10.10
PC-D  IPv4 192.168.10.47   Mask 255.255.255.0    Gateway 192.168.10.1   DNS 192.168.10.250
PC-E  IPv4 192.168.10.48   Mask 255.255.255.0    Gateway 192.168.10.1   DNS 192.168.10.10</pre>
<p>PC-D can ping 8.8.8.8 but can't open websites by name. PC-E's user says 'the internet is slow today'.</p>`,
  prompt: "Choose the problem for each PC.",
  options: ["Can't reach DHCP server (APIPA)", "Incorrect default gateway", "Incorrect subnet mask", "Incorrect DNS server", "Duplicate IP address", "No configuration issue"],
  rows: [
    { label: "PC-A", a: "Can't reach DHCP server (APIPA)", why: "169.254.x.x with no gateway = APIPA. The PC never got a DHCP lease. Check the cable/VLAN, the DHCP server or the relay." },
    { label: "PC-B", a: "Incorrect default gateway", why: "The gateway 192.168.20.1 isn't even in its own subnet. Local traffic works, remote traffic fails." },
    { label: "PC-C", a: "Incorrect subnet mask", why: "/30 (255.255.255.252) makes the PC think only .44–.47 are local, and the gateway .1 isn't 'local' anymore. It should be /24." },
    { label: "PC-D", a: "Incorrect DNS server", why: "Ping by IP works but names fail, and DNS points at .250 instead of .10. Wrong DNS server." },
    { label: "PC-E", a: "No configuration issue", why: "Everything matches the network. 'Slow' is a performance issue to investigate elsewhere, not an IP config error." }
  ],
  clue: "Read ipconfig in this order: <b>169.254? → DHCP. Gateway in my subnet? → gateway. Mask matches? → mask. Names fail but IPs work? → DNS.</b>",
  trig: "Always compare each PC's config to the <b>known-good network values</b> given in the question. One PC is often the 'nothing wrong' decoy."
},
{
  id: "p-07", o: "1.7", type: "match",
  title: "Subnet calculation",
  setup: "<p>A host is configured as <b>172.16.45.200/27</b>.</p>",
  prompt: "Fill in each value for this host's subnet.",
  rows: [
    { label: "Subnet mask", a: "255.255.255.224", options: ["255.255.255.192", "255.255.255.224", "255.255.255.240", "255.255.255.248"], why: "/27 = 8 + 8 + 8 + 3 bits → last octet 11100000 = 224." },
    { label: "Network address", a: "172.16.45.192", options: ["172.16.45.128", "172.16.45.160", "172.16.45.192", "172.16.45.200"], why: "Block size = 256 − 224 = 32. Multiples of 32: 0, 32, …, 160, <b>192</b>, 224. 200 falls in the 192 block." },
    { label: "First usable host", a: "172.16.45.193", options: ["172.16.45.192", "172.16.45.193", "172.16.45.201", "172.16.45.161"], why: "Network + 1." },
    { label: "Last usable host", a: "172.16.45.222", options: ["172.16.45.222", "172.16.45.223", "172.16.45.254", "172.16.45.230"], why: "Broadcast − 1." },
    { label: "Broadcast address", a: "172.16.45.223", options: ["172.16.45.223", "172.16.45.224", "172.16.45.255", "172.16.45.207"], why: "Next subnet (224) − 1 = 223." },
    { label: "Usable hosts per subnet", a: "30", options: ["14", "30", "32", "62"], why: "2^5 host bits = 32, minus network and broadcast = 30." }
  ],
  clue: "<b>Magic number = 256 − mask octet.</b> Count up by it until you pass the IP. Network = the block start, broadcast = the next block − 1.",
  trig: "/25=128, /26=64, /27=32, /28=16, /29=8, /30=4 (block sizes). Memorize these and every subnet question takes about 20 seconds."
},
{
  id: "p-08", o: "3.4", type: "order",
  title: "DHCP lease process",
  setup: "<p>A new laptop with no IP address connects to the network and gets an address from the DHCP server.</p>",
  prompt: "Put the DHCP messages in the order they happen.",
  items: [
    { t: "Discover: client broadcasts looking for any DHCP server", why: "The client has no IP yet, so it broadcasts (from 0.0.0.0 to 255.255.255.255)." },
    { t: "Offer: server offers an available IP address and options", why: "The server proposes an address plus the mask, gateway, DNS and lease time." },
    { t: "Request: client asks to use the offered address", why: "Broadcast, so any other servers that made offers know they weren't picked." },
    { t: "Acknowledge: server confirms the lease", why: "ACK. Now the client can use the address for the lease period." }
  ],
  clue: "<b>DORA</b>: Discover, Offer, Request, Acknowledge.",
  trig: "Clients across a router need a <b>DHCP relay / IP helper</b>, because Discover is a broadcast and routers don't forward broadcasts."
},
{
  id: "p-09", o: "2.3", type: "match",
  title: "Configure a wireless deployment",
  setup: "<p>A small company is rolling out Wi-Fi. There's an employee network, a guest network, three APs close together in an open office, a ceiling AP in the lobby, and a 400 m link to a warehouse across the parking lot.</p>",
  prompt: "Choose the best setting for each requirement.",
  options: ["WPA3-Enterprise (802.1X/RADIUS)", "WPA3-Personal (SAE)", "Captive portal", "WEP", "Channels 1, 6, 11", "Channels 1, 2, 3", "Omnidirectional antenna", "Directional antenna (Yagi/parabolic)"],
  rows: [
    { label: "Employee SSID: each person signs in with their own domain account", a: "WPA3-Enterprise (802.1X/RADIUS)", why: "Individual credentials = Enterprise mode with 802.1X/RADIUS." },
    { label: "Guest SSID: visitors accept terms before browsing", a: "Captive portal", why: "A splash page with terms is a captive portal." },
    { label: "Small IoT devices that only support a shared passphrase", a: "WPA3-Personal (SAE)", why: "Shared passphrase = Personal mode. WPA3 with SAE is the strongest version." },
    { label: "2.4 GHz channels for three neighboring APs", a: "Channels 1, 6, 11", why: "The only three non-overlapping 2.4 GHz channels in the US." },
    { label: "Lobby AP mounted in the middle of the ceiling", a: "Omnidirectional antenna", why: "Covers 360° around itself, ideal for the center of a room." },
    { label: "Point-to-point link to the warehouse 400 m away", a: "Directional antenna (Yagi/parabolic)", why: "Focuses the signal in one direction for long distances." }
  ],
  clue: "<b>Own account → Enterprise. Shared password → Personal. Terms page → captive portal. Center of room → omni. Far away → directional.</b>",
  trig: "WEP and channels 1/2/3 are always wrong. Wireless PBQs reward <b>security mode + channels + antenna</b>."
},
{
  id: "p-10", o: "3.3", type: "match",
  title: "Disaster recovery terms",
  setup: "<p>You're writing the disaster recovery plan. Match each statement to the right term.</p>",
  prompt: "Choose the term for each statement.",
  options: ["RPO", "RTO", "MTTR", "MTBF", "Hot site", "Warm site", "Cold site", "Tabletop exercise"],
  rows: [
    { label: "'We can lose at most 15 minutes of transactions.'", a: "RPO", why: "Maximum data loss, measured backward in time." },
    { label: "'Systems must be back up within 4 hours.'", a: "RTO", why: "Maximum downtime." },
    { label: "'On average it takes our team 45 minutes to replace a failed switch.'", a: "MTTR", why: "Mean time to repair: the average fix time." },
    { label: "'This power supply runs 200,000 hours on average before failing.'", a: "MTBF", why: "Mean time between failures: reliability." },
    { label: "Fully running duplicate with real-time data; failover in minutes", a: "Hot site", why: "Most expensive, fastest." },
    { label: "Hardware in place, but data must be restored before going live", a: "Warm site", why: "The middle option: hours to days." },
    { label: "Space, power and cooling only; equipment must be brought in", a: "Cold site", why: "Cheapest, slowest (days to weeks)." },
    { label: "The team talks through a disaster scenario in a meeting room", a: "Tabletop exercise", why: "Discussion only, no systems touched." }
  ],
  clue: "<b>RP<u>O</u> = data (the Point you roll back to). RT<u>O</u> = Time to get back On. MTTR = Repair. MTBF = Between Failures.</b>",
  trig: "'Data loss' → RPO. 'Downtime' → RTO. 'Average repair' → MTTR. 'Reliability' → MTBF."
}
);
