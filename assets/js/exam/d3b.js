/* Exam drill bank, Domain 3 "twins". Format: see d1.js. */
(window.NP_EXAM = window.NP_EXAM || { mc: [], pbq: [] }).mc.push(
{
  id: "t3-01", o: "3.1",
  q: "An auditor wants a list of every network device with its serial number, purchase date, warranty end date and location. Which document provides this?",
  c: ["Logical diagram", "Asset inventory", "Baseline configuration", "SLA"],
  a: 1,
  why: "An <b>asset inventory</b> tracks hardware and software: serials, models, locations, owners, warranty and licensing.",
  no: ["A logical diagram shows traffic flow, not serial numbers or warranties.", "", "A baseline config is a known-good configuration, not a list of devices.", "An SLA is a service contract."],
  clue: "<b>Inventory = what we own and where it is.</b>",
  trig: "'Serial numbers', 'warranty', 'what we own', 'licensing' → <b>asset inventory</b>."
},
{
  id: "t3-02", o: "3.1",
  q: "A vendor announces it will stop selling a switch model next quarter but will keep releasing security patches for three more years. Which lifecycle milestone was announced?",
  c: ["End-of-life (EOL)", "End-of-support (EOS)", "Decommissioning", "Zero-day"],
  a: 0,
  why: "<b>End-of-life (EOL)</b> = the vendor stops <b>selling/making</b> it. Support and patches can continue until <b>end-of-support</b>.",
  no: ["", "End-of-support is when <b>patches and support stop</b>. They're still coming here.", "Decommissioning is <b>you</b> retiring a device from your network.", "A zero-day is an unpatched, newly exploited vulnerability."],
  clue: "<b>EOL = off the shelf. EOS = no more help.</b> EOS is the dangerous one, because there are no more security fixes.",
  trig: "'No longer sold' → <b>EOL</b>. 'No more patches/support' → <b>EOS</b>."
},
{
  id: "t3-03", o: "3.1",
  q: "A company is retiring 30 old switches and sending them to a recycler. What should be done FIRST?",
  c: ["Ship them as-is to save time", "Wipe configurations and sanitize storage, then update the asset inventory and documentation", "Keep the configs on the devices as a backup", "Only remove the power supplies"],
  a: 1,
  why: "<b>Decommissioning</b>: sanitize the devices (erase configs, which hold passwords, SNMP strings and IP plans), then <b>update the inventory and diagrams</b> so the records match reality.",
  no: ["Configs left on the switches leak credentials and network details to whoever gets them.", "", "Backups belong in your config management system, not on devices you're giving away.", "Removing PSUs does nothing to protect the data."],
  clue: "<b>Decommission = wipe it and write it down.</b>",
  trig: "'Retire/dispose of devices' → <b>sanitize + update documentation</b>."
},
{
  id: "t3-04", o: "3.2",
  q: "Switches are monitored with SNMPv2c. A security review notes that anyone sniffing the network can read the access credential. What should be done?",
  c: ["Change the community string to a longer one", "Migrate to SNMPv3 with authentication and encryption", "Move SNMP to TCP", "Disable SNMP traps only"],
  a: 1,
  why: "SNMPv1/v2c send the <b>community string in clear text</b>. <b>SNMPv3</b> adds user-based <b>authentication and encryption</b> (authPriv).",
  no: ["A longer string is still sent in clear text and can still be sniffed.", "", "SNMP uses UDP, and switching transport doesn't add encryption.", "Traps aren't the issue. The credential is exposed on every SNMP message."],
  clue: "<b>v1/v2c = a password on a postcard. v3 = a sealed envelope.</b>",
  trig: "'SNMP' + 'secure/encrypted/clear text' → <b>SNMPv3</b>."
},
{
  id: "t3-05", o: "3.2",
  q: "A manager asks which hosts used the most bandwidth yesterday and which applications they used. Full packet payloads are NOT needed. Which data source BEST answers this?",
  c: ["Full packet capture", "Flow data (NetFlow/IPFIX/sFlow)", "Syslog", "SNMP interface utilization only"],
  a: 1,
  why: "<b>Flow data</b> records <b>who talked to whom, on which ports, how much and when</b>, without the payloads. It's perfect for top talkers and app usage.",
  no: ["Full packet capture works but is huge and unnecessary when payloads aren't needed.", "", "Syslog records device events, not per-conversation traffic.", "SNMP shows total interface usage, not <b>which hosts</b> used it."],
  clue: "<b>Flow = a phone bill</b>: who called whom, for how long. <b>Packet capture = a recording</b> of the call.",
  trig: "'Top talkers', 'who talked to whom', 'without payload' → <b>NetFlow/IPFIX</b>."
},
{
  id: "t3-06", o: "3.2",
  q: "A web request keeps failing, and the developer needs to see the actual HTTP headers and TCP flags exchanged between client and server. Which tool provides this?",
  c: ["Flow collector", "Protocol analyzer (packet capture)", "SNMP poller", "Syslog server"],
  a: 1,
  why: "A <b>protocol analyzer</b> (Wireshark, tcpdump) captures <b>every packet</b>, with full headers and payload. It's the only option that shows the actual HTTP and TCP detail.",
  no: ["Flow data summarizes conversations and doesn't include headers or payloads.", "", "SNMP gives counters and status, not packets.", "Syslog gives device log messages."],
  clue: "<b>Need to see INSIDE the packet → packet capture.</b>",
  trig: "'See headers', 'payload', 'TCP flags', 'decode the conversation' → <b>packet capture/protocol analyzer</b>."
},
{
  id: "t3-07", o: "3.2",
  q: "On the syslog severity scale, which level is the MOST severe?",
  c: ["0 – Emergency", "3 – Error", "5 – Notice", "7 – Debug"],
  a: 0,
  why: "Syslog severities run from <b>0 (Emergency, system unusable)</b> to <b>7 (Debug)</b>. <b>Lower number = more severe.</b>",
  no: ["", "3 (Error) is serious but less severe than 0, 1 and 2.", "5 (Notice) is a normal but significant event.", "7 (Debug) is the least severe and very chatty."],
  clue: "<b>0-7: 'Every Awesome Cisco Engineer Will Need Ice cream Daily'</b>: Emergency, Alert, Critical, Error, Warning, Notice, Informational, Debug.",
  trig: "'Most severe' → <b>0 Emergency</b>. 'Most verbose' → <b>7 Debug</b>."
},
{
  id: "t3-08", o: "3.3",
  q: "To meet a business requirement, a company starts replicating its database to the DR site every 15 minutes instead of nightly. Which objective is this change designed to meet?",
  c: ["RTO", "RPO", "MTBF", "SLA response time"],
  a: 1,
  why: "Replicating more often shrinks how much <b>data</b> could be lost. That's the <b>RPO</b>, now 15 minutes.",
  no: ["RTO is about how fast you're back <b>up</b>. Replication frequency is about <b>data loss</b>.", "", "MTBF is hardware reliability.", "SLA response time is how fast a provider responds."],
  clue: "<b>How often you back up = your RPO.</b> Nightly backups = up to 24 hours of data lost.",
  trig: "'Backup/replication frequency', 'data loss' → <b>RPO</b>."
},
{
  id: "t3-09", o: "3.3",
  q: "Over the past year, router failures took 20, 40 and 60 minutes to fix. What is the MTTR?",
  c: ["20 minutes", "40 minutes", "60 minutes", "120 minutes"],
  a: 1,
  why: "<b>MTTR = mean time to repair</b> = average fix time = (20 + 40 + 60) / 3 = <b>40 minutes</b>.",
  no: ["20 minutes is the fastest repair, not the average.", "", "60 minutes is the slowest.", "120 minutes is the total, not the mean."],
  clue: "<b>MTTR = the average time on the operating table.</b>",
  trig: "'Average time to fix/restore' → <b>MTTR</b>."
},
{
  id: "t3-10", o: "3.3",
  q: "A startup with a tight budget needs a DR location. It accepts that recovery could take weeks. Which option is MOST cost-effective?",
  c: ["Hot site", "Warm site", "Cold site", "Active-active data center"],
  a: 2,
  why: "A <b>cold site</b> is just space, power and connectivity, with no equipment or data. It's the cheapest option and the slowest to recover.",
  no: ["A hot site is the most expensive: fully running.", "A warm site has hardware staged, so it costs more than cold.", "", "Active-active means two full production sites, the highest cost."],
  clue: "<b>Cold = cheap, empty, slow.</b> Temperature tracks readiness and cost.",
  trig: "'Cheapest', 'weeks acceptable', 'empty facility' → <b>cold site</b>."
},
{
  id: "t3-11", o: "3.3",
  q: "Two data centers both serve customer traffic at the same time. If one fails, the other absorbs the full load. What is this design?",
  c: ["Active-passive", "Active-active", "Cold standby", "Tabletop"],
  a: 1,
  why: "<b>Active-active</b>: every site or node handles traffic <b>at the same time</b> and shares the load. Losing one reduces capacity, not service.",
  no: ["Active-passive keeps one side idle until failover.", "", "A cold standby isn't running at all.", "A tabletop is a discussion-based test."],
  clue: "<b>Active-active = both engines running.</b>",
  trig: "'Both serve traffic simultaneously', 'load shared' → <b>active-active</b>."
},
{
  id: "t3-12", o: "3.4",
  q: "A web server gets an IPv6 address. Which DNS record should be created so clients can resolve its name to that IPv6 address?",
  c: ["A", "AAAA", "PTR", "CNAME"],
  a: 1,
  why: "An <b>AAAA</b> ('quad A') record maps a name to an <b>IPv6</b> address.",
  no: ["An A record maps a name to an <b>IPv4</b> address.", "", "A PTR is the reverse lookup (IP → name).", "A CNAME is an alias to another name."],
  clue: "<b>IPv6 is 4× longer (128 vs 32 bits) → AAAA = 4 A's.</b>",
  trig: "'IPv6 address for a name' → <b>AAAA</b>."
},
{
  id: "t3-13", o: "3.4",
  q: "Which DNS record holds a zone's primary name server, the admin contact, the serial number and the refresh timers that secondary servers use?",
  c: ["NS", "SOA", "MX", "TXT"],
  a: 1,
  why: "The <b>SOA (start of authority)</b> is the first record in a zone. It carries the zone's <b>serial number</b> and <b>timers</b>, which secondaries use to decide when to pull a zone transfer.",
  no: ["NS lists the authoritative servers, but not the serial number or timers.", "", "MX points to mail servers.", "TXT holds free text such as SPF and DKIM."],
  clue: "<b>SOA = the zone's birth certificate</b>: who's in charge, version number, timers.",
  trig: "'Serial number', 'refresh/retry timers', 'zone authority info' → <b>SOA</b>."
},
{
  id: "t3-14", o: "3.4",
  q: "Which DNS server holds the actual, original records for the example.com zone and answers with authority rather than from cache?",
  c: ["Recursive resolver", "Authoritative name server", "Caching-only server", "Forwarder"],
  a: 1,
  why: "An <b>authoritative</b> server hosts the zone file itself. Its answers are the official source.",
  no: ["A recursive resolver chases answers <b>for</b> clients (asking root, TLD and authoritative servers) and caches them. It isn't the source.", "", "A caching-only server just remembers answers it was given.", "A forwarder hands queries to another server."],
  clue: "<b>Authoritative = the author of the records. Recursive = the librarian who goes and finds them.</b>",
  trig: "'Holds the zone', 'official answer' → <b>authoritative</b>. 'Looks it up on behalf of the client' → <b>recursive</b>."
},
{
  id: "t3-15", o: "3.4",
  q: "Only one PC resolves intranet.corp to an old IP address. DNS returns the correct address to everyone else, and flushing the DNS cache doesn't help. What should the technician check?",
  c: ["The PC's hosts file", "The DHCP scope", "The PTR record", "The switch's MAC table"],
  a: 0,
  why: "The <b>hosts file</b> is checked <b>before DNS</b>. A stale static entry there overrides the correct DNS answer on that one machine, and flushing the cache doesn't remove it.",
  no: ["", "DHCP hands out the DNS server address. Everyone uses the same DNS and gets the correct answer.", "A PTR record is a reverse lookup and doesn't affect forward resolution.", "The MAC table is Layer 2 switching and has nothing to do with names."],
  clue: "<b>Hosts file = a sticky note that beats the phone book.</b>",
  trig: "'Only one PC resolves wrong', 'DNS is correct', 'flush didn't help' → <b>hosts file</b>."
},
{
  id: "t3-16", o: "3.4",
  q: "Clients on VLAN 30 get APIPA addresses. The DHCP server is in the data center on a different subnet, and the scope for VLAN 30 exists and has free addresses. What is MOST likely missing?",
  c: ["A DHCP reservation", "A DHCP relay (IP helper) on the VLAN 30 gateway interface", "An exclusion range", "A shorter lease time"],
  a: 1,
  why: "DHCP Discover is a <b>broadcast</b>, and routers don't forward broadcasts. The VLAN 30 gateway needs a <b>DHCP relay / ip helper-address</b> to forward requests to the server as unicast.",
  no: ["A reservation is for one specific device, not a whole VLAN.", "", "An exclusion blocks addresses from being handed out. The problem is that requests never reach the server.", "Lease time doesn't matter if the server never hears the request."],
  clue: "<b>Broadcasts stop at the router. The IP helper carries the message across.</b>",
  trig: "'DHCP server on another subnet', 'one VLAN gets 169.254' → <b>DHCP relay/IP helper</b>."
},
{
  id: "t3-17", o: "3.4",
  q: "A security team wants time synchronization that cryptographically authenticates the time source so attackers can't feed false time. Which protocol should be used?",
  c: ["NTP (unauthenticated)", "NTS (Network Time Security)", "PTP", "SNMP"],
  a: 1,
  why: "<b>NTS</b> adds <b>TLS-based authentication</b> to NTP, so clients can verify the time is coming from the real server.",
  no: ["Plain NTP can be spoofed. There's no modern cryptographic authentication.", "", "PTP is for <b>sub-microsecond precision</b> (trading, telecom), not authentication.", "SNMP is device management."],
  clue: "<b>NTS = NTP + Security.</b> PTP = Precision. NTP = normal time.",
  trig: "'Secure/authenticated time' → <b>NTS</b>. 'Ultra-precise time' → <b>PTP</b>."
},
{
  id: "t3-18", o: "3.5",
  q: "A branch office LAN must be permanently connected to the HQ LAN over the internet. The routers at each site should build an encrypted tunnel automatically, so users need no software. What should be used?",
  c: ["Client-to-site VPN", "Site-to-site IPsec VPN", "Clientless VPN", "Jump box"],
  a: 1,
  why: "A <b>site-to-site VPN</b> connects <b>whole networks</b>, gateway to gateway, with an always-on encrypted tunnel (usually IPsec). Users don't do anything.",
  no: ["Client-to-site requires each user to run VPN software.", "", "A clientless VPN gives individual browser access to apps, not network-to-network.", "A jump box is an admin access host."],
  clue: "<b>Site-to-site = building to building. Client-to-site = person to building.</b>",
  trig: "'Connect two offices', 'always on', 'router to router' → <b>site-to-site</b>."
},
{
  id: "t3-19", o: "3.5",
  q: "An admin manages switches over SSH using the same production network that carries user traffic. What is this management approach called, and what is its main weakness?",
  c: ["Out-of-band; it fails when the console cable is unplugged", "In-band; if the production network goes down, management access is lost too", "Clientless; it needs a browser", "Jump box; it needs a VPN"],
  a: 1,
  why: "<b>In-band</b> management uses the production network. When the network breaks, so does your way in. That's why critical sites add <b>out-of-band</b> access (a console server or cellular link).",
  no: ["Out-of-band uses a <b>separate</b> path. That's not what's described.", "", "Clientless refers to VPN access, not device management.", "A jump box is an access host and can work in-band or out-of-band."],
  clue: "<b>In-band = the same road as traffic. Out-of-band = a private side road for emergencies.</b>",
  trig: "'Same network as users' → <b>in-band</b>. 'Network down but still need access' → <b>out-of-band</b>."
},
{
  id: "t3-20", o: "3.5",
  q: "An automation platform changes VLANs on 200 switches by sending structured requests (JSON over HTTPS) directly to each device's management interface. Which connection method is this?",
  c: ["Console", "API", "GUI", "Telnet"],
  a: 1,
  why: "An <b>API</b> (usually REST with JSON/XML over HTTPS) lets software configure devices programmatically. It's the basis of network automation.",
  no: ["Console is a physical serial connection, one device at a time.", "", "A GUI is a human clicking through web pages, not automated.", "Telnet is an insecure, human-oriented CLI."],
  clue: "<b>API = software talking to software.</b> GUI/CLI = humans.",
  trig: "'Automation', 'programmatic', 'REST', 'JSON' → <b>API</b>."
}
);
