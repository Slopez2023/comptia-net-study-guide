/* Exam drill bank, Domain 4 "twins". Format: see d1.js. */
(window.NP_EXAM = window.NP_EXAM || { mc: [], pbq: [] }).mc.push(
{
  id: "t4-01", o: "4.1",
  q: "A company adds redundant ISP links, dual power supplies and a hot standby firewall. Which part of the CIA triad does this mainly protect?",
  c: ["Confidentiality", "Integrity", "Availability", "Authentication"],
  a: 2,
  why: "Redundancy keeps systems <b>up and reachable</b>. That's <b>availability</b>.",
  no: ["Confidentiality is about keeping data secret (encryption, access control).", "Integrity is about keeping data unaltered (hashing, signatures).", "", "Authentication proves identity. It's part of AAA, not the CIA triad."],
  clue: "<b>A = Always up.</b> Redundancy, backups, DDoS protection = availability.",
  trig: "'Redundant', 'uptime', 'failover', 'DDoS' → <b>availability</b>."
},
{
  id: "t4-02", o: "4.1",
  q: "Help desk staff need to reset user passwords. They are given exactly that right and nothing else, not domain admin. Which principle is applied?",
  c: ["Least privilege", "Separation of duties", "Defense in depth", "Implicit deny"],
  a: 0,
  why: "<b>Least privilege</b>: give each person only the minimum access they need to do their job.",
  no: ["", "Separation of duties splits a critical task between several people so no one person can abuse it.", "Defense in depth layers many controls.", "Implicit deny is the 'block anything not allowed' rule at the end of ACLs."],
  clue: "<b>Least privilege = 'need to know, need to do'. Nothing extra.</b>",
  trig: "'Only the rights needed', 'minimum access' → <b>least privilege</b>."
},
{
  id: "t4-03", o: "4.1",
  q: "Users sign in once in the morning and can then open email, the HR portal and the CRM without entering credentials again. What is this?",
  c: ["Multifactor authentication", "Single sign-on (SSO)", "Role-based access control", "Time-based authentication"],
  a: 1,
  why: "<b>SSO</b>: authenticate once and get access to many applications. On the web it's usually built on <b>SAML</b> or OpenID Connect.",
  no: ["MFA uses several <b>factors</b> at one login, not one login for many apps.", "", "RBAC decides what you can do based on role.", "Time-based authentication limits <b>when</b> you can log in."],
  clue: "<b>SSO = one key opens every door in the building.</b> SAML is the key-cutting standard.",
  trig: "'Log in once, access many apps' → <b>SSO</b> (often via <b>SAML</b>)."
},
{
  id: "t4-04", o: "4.1",
  q: "Router and switch administrators must be authenticated centrally. Each command they type must be individually authorized, and the entire AAA payload must be encrypted. Which protocol is BEST?",
  c: ["RADIUS", "TACACS+", "LDAP", "Kerberos"],
  a: 1,
  why: "<b>TACACS+</b> (TCP 49) <b>separates</b> authentication, authorization and accounting, supports <b>per-command authorization</b>, and <b>encrypts the whole payload</b>.",
  no: ["RADIUS combines authentication and authorization and encrypts only the password. It's better for network access (Wi-Fi/VPN).", "", "LDAP is a directory query protocol, not device AAA.", "Kerberos is ticket-based authentication for domains, not per-command device authorization."],
  clue: "<b>TACACS+ = Terminal Access (admins on devices). RADIUS = Remote users on the network.</b>",
  trig: "'Device administration', 'per-command authorization', 'full encryption', 'TCP 49' → <b>TACACS+</b>."
},
{
  id: "t4-05", o: "4.1",
  q: "A security report says a web server is running a version of software with a known, unpatched flaw. In risk terms, what is the unpatched flaw?",
  c: ["Threat", "Vulnerability", "Exploit", "Risk"],
  a: 1,
  why: "A <b>vulnerability</b> is a <b>weakness</b>, like an unpatched flaw or misconfiguration, that could be used against you.",
  no: ["A threat is the <b>actor or event</b> that could cause harm (a hacker group, malware).", "", "An exploit is the <b>code or technique</b> that takes advantage of a vulnerability.", "Risk is the likelihood × impact of a threat exploiting a vulnerability."],
  clue: "<b>Vulnerability = the open window. Threat = the burglar. Exploit = climbing through. Risk = the odds × the damage.</b>",
  trig: "'Weakness', 'unpatched', 'misconfiguration' → <b>vulnerability</b>. 'Attacker' → <b>threat</b>."
},
{
  id: "t4-06", o: "4.1",
  q: "The security team builds a whole fake network segment of decoy servers and workstations to observe how attackers move laterally. What is this?",
  c: ["Honeypot", "Honeynet", "Screened subnet", "Sandbox"],
  a: 1,
  why: "A <b>honeynet</b> is a <b>network</b> of decoys. A honeypot is a single decoy system.",
  no: ["A honeypot is <b>one</b> decoy system. This is a whole segment.", "", "A screened subnet hosts <b>real</b> public-facing servers.", "A sandbox safely runs suspicious files to analyze them."],
  clue: "<b>Honeypot = one jar. Honeynet = the whole field of jars.</b>",
  trig: "'Single decoy' → <b>honeypot</b>. 'Network of decoys' → <b>honeynet</b>."
},
{
  id: "t4-07", o: "4.1",
  q: "A company's smart TVs, thermostats and badge readers are on the same network as employee laptops. What is the BEST way to reduce the risk these IoT devices pose?",
  c: ["Install antivirus on each IoT device", "Place IoT devices in their own segmented VLAN with restrictive ACLs", "Give IoT devices static IPs", "Hide the SSID"],
  a: 1,
  why: "IoT devices are hard to patch and secure. <b>Segmenting</b> them into their own VLAN or zone with <b>tight ACLs</b> limits what an attacker can reach if one gets compromised.",
  no: ["Most IoT devices can't run antivirus.", "", "Static IPs don't restrict access.", "Hiding the SSID is weak and does nothing for wired IoT devices."],
  clue: "<b>Can't secure it? Isolate it.</b> IoT, OT, SCADA, guests, BYOD each get their own zone.",
  trig: "'IoT/IIoT/SCADA/OT/guest/BYOD' + 'reduce risk' → <b>segmentation</b>."
},
{
  id: "t4-08", o: "4.1",
  q: "A US company begins collecting personal data from customers living in France and Germany. Which regulation applies to that data?",
  c: ["PCI DSS", "GDPR", "HIPAA", "SOX"],
  a: 1,
  why: "<b>GDPR</b> protects the personal data of people in the <b>EU</b>, no matter where the company is located.",
  no: ["PCI DSS covers payment card data.", "", "HIPAA covers US health information.", "SOX covers US public companies' financial reporting."],
  clue: "<b>GDPR = General Data Protection Regulation (EU).</b> EU people → GDPR, even for a US company.",
  trig: "'EU residents' personal data' → <b>GDPR</b>."
},
{
  id: "t4-09", o: "4.2",
  q: "In a coffee shop, an attacker silently relays traffic between a victim's laptop and a banking site, reading and altering the data along the way. What is this attack called?",
  c: ["DDoS", "On-path (man-in-the-middle)", "Dumpster diving", "MAC flooding"],
  a: 1,
  why: "An <b>on-path</b> attacker places themselves <b>between</b> two parties and intercepts, reads or modifies traffic. ARP poisoning and evil twins are common ways to get there.",
  no: ["A DDoS floods a target. It doesn't intercept traffic.", "", "Dumpster diving is searching through trash.", "MAC flooding overwhelms a switch's CAM table. It can lead to sniffing but isn't the relay-and-alter attack described."],
  clue: "<b>On-path = a mail carrier who opens your letters, reads them and reseals them.</b>",
  trig: "'Intercepts', 'relays', 'between victim and server', 'alters traffic' → <b>on-path</b>."
},
{
  id: "t4-10", o: "4.2",
  q: "Employees get an email that looks like it's from IT, warning that their mailbox is full and asking them to click a link and enter their password. What attack is this?",
  c: ["Phishing", "Tailgating", "Shoulder surfing", "Evil twin"],
  a: 0,
  why: "<b>Phishing</b> uses fraudulent messages that impersonate a trusted sender to steal credentials or deliver malware.",
  no: ["", "Tailgating is physically following someone through a door.", "Shoulder surfing is watching someone type.", "An evil twin is a fake Wi-Fi AP."],
  clue: "<b>Phishing = fishing with fake bait</b> (emails). Targeted at a specific person = spear phishing.",
  trig: "'Email/text pretending to be…', 'click link, enter password' → <b>phishing</b>."
},
{
  id: "t4-11", o: "4.2",
  q: "A hotel guest connects to 'Grand-Hotel-WiFi', which is actually an attacker's laptop broadcasting the same name with a stronger signal than the hotel's APs. What is this?",
  c: ["Rogue access point", "Evil twin", "Bluejacking", "War driving"],
  a: 1,
  why: "An <b>evil twin</b> <b>impersonates a legitimate SSID</b> to lure users and then intercepts their traffic.",
  no: ["A rogue AP is any unauthorized AP, often an employee's, and it isn't necessarily copying a real SSID.", "", "Bluejacking sends unsolicited Bluetooth messages.", "War driving is driving around mapping Wi-Fi networks."],
  clue: "<b>Evil twin = an identical twin with bad intentions</b>: same name, different device.",
  trig: "'Same SSID as legitimate', 'stronger signal', 'impersonates' → <b>evil twin</b>."
},
{
  id: "t4-12", o: "4.3",
  q: "Users intermittently get a default gateway of 192.168.0.1 (a consumer router's default) instead of the corporate 10.10.0.1. Which switch feature PREVENTS this?",
  c: ["Port mirroring", "DHCP snooping", "PortFast", "Jumbo frames"],
  a: 1,
  why: "The wrong gateway comes from a <b>rogue DHCP server</b>. <b>DHCP snooping</b> marks only the uplink toward the real server as trusted and drops DHCP offers arriving on any other port.",
  no: ["Port mirroring copies traffic. It doesn't block anything.", "", "PortFast speeds up edge-port startup.", "Jumbo frames are a performance setting."],
  clue: "<b>DHCP snooping = only the real DHCP server gets a microphone.</b>",
  trig: "'Wrong gateway/DNS from DHCP', 'rogue DHCP' → <b>DHCP snooping</b>."
},
{
  id: "t4-13", o: "4.3",
  q: "A switch port in a lobby kiosk should allow at most one device. If a different device's MAC address appears, the port should shut down. What should be configured?",
  c: ["802.1Q", "Port security with a maximum of 1 MAC and shutdown violation mode", "BPDU guard", "STP root guard"],
  a: 1,
  why: "<b>Port security</b> limits the number of MACs per port (and can learn them as 'sticky'). A <b>shutdown</b> violation err-disables the port when an unknown MAC shows up.",
  no: ["802.1Q is VLAN tagging.", "", "BPDU guard reacts to switches (BPDUs), not to a different PC.", "Root guard protects the STP root bridge position."],
  clue: "<b>Port security = the port remembers its device's MAC</b> and slams shut for strangers.",
  trig: "'Limit MACs per port', 'shut down if another device' → <b>port security</b>."
},
{
  id: "t4-14", o: "4.3",
  q: "In an 802.1X deployment, which role does the RADIUS server play?",
  c: ["Supplicant", "Authenticator", "Authentication server", "Certificate authority"],
  a: 2,
  why: "802.1X roles: <b>supplicant</b> = the client device, <b>authenticator</b> = the switch or AP, <b>authentication server</b> = RADIUS, which makes the decision.",
  no: ["The supplicant is the <b>client</b> asking for access.", "The authenticator is the <b>switch/AP</b> that relays the request and opens the port.", "", "A CA issues certificates. It may support EAP-TLS, but it isn't one of the three 802.1X roles."],
  clue: "<b>Supplicant supplies credentials → Authenticator (switch) passes them → Authentication server (RADIUS) decides.</b>",
  trig: "'802.1X' + 'client' → supplicant. 'Switch/AP' → authenticator. 'RADIUS' → <b>authentication server</b>."
},
{
  id: "t4-15", o: "4.3",
  q: "A company puts its public web and mail servers in a zone between an internet-facing firewall and an internal firewall, so a compromised public server can't directly reach the LAN. What is this zone?",
  c: ["Intranet", "Screened subnet (DMZ)", "Guest VLAN", "Management VLAN"],
  a: 1,
  why: "A <b>screened subnet</b> (formerly 'DMZ') holds <b>public-facing</b> services. It's isolated from the trusted LAN, so a breach there doesn't hand attackers the internal network.",
  no: ["The intranet is the trusted internal network, which is what the zone protects.", "", "A guest VLAN is for visitors' devices, not public servers.", "A management VLAN carries device administration traffic."],
  clue: "<b>Screened subnet = the lobby</b>: the public can come in, but the office doors stay locked.",
  trig: "'Public-facing servers', 'between firewalls', 'DMZ' → <b>screened subnet</b>."
}
);
