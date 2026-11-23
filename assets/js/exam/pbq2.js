/* More PBQs, closer to real simulations.
   type "spot": click devices on a diagram to inspect their config, mark the faulty one, choose the fix.
     nodes [{id, label, kind, x, y, cfg}], links [[a, b, label?]], a (faulty node id),
     fixes [...], fixA, fixWhy, nodeWhy {id: why}.
   type "match"/"order": see pbq.js. */
(window.NP_EXAM = window.NP_EXAM || { mc: [], pbq: [] }).pbq.push(
{
  id: "p-11", o: "5.3", type: "spot",
  title: "VLAN 20 can't reach its gateway",
  setup: "<p>Users on <b>Access-SW2</b> in VLAN 20 (Accounting) get no response from their gateway 10.20.0.1, which is on the core switch. Users in VLAN 10 on the same access switch work fine.</p>",
  prompt: "Inspect the devices, mark the one with the fault, then choose the fix.",
  nodes: [
    { id: "fw", label: "FW-1", kind: "firewall", x: 90, y: 60, cfg: "outside: 203.0.113.2/30\ninside : 10.0.0.1/30\npolicy : permit inside → any (stateful)\nstatus : all interfaces up" },
    { id: "core", label: "Core-SW1", kind: "L3 switch", x: 320, y: 60, cfg: "interface Vlan10  ip 10.10.0.1/24  up/up\ninterface Vlan20  ip 10.20.0.1/24  up/up\n\ninterface Gi1/0/24  (to Access-SW2)\n switchport mode trunk\n switchport trunk allowed vlan 10,30\n status: connected" },
    { id: "acc", label: "Access-SW2", kind: "switch", x: 320, y: 210, cfg: "interface Gi0/48  (uplink)\n switchport mode trunk\n switchport trunk allowed vlan 10,20,30\n\ninterface Gi0/5  switchport access vlan 20  connected\ninterface Gi0/6  switchport access vlan 10  connected" },
    { id: "pc20", label: "Acct-PC (VLAN 20)", kind: "pc", x: 140, y: 250, cfg: "IPv4 10.20.0.57/24\nGateway 10.20.0.1\nDNS 10.0.10.10\nping 10.20.0.1 → Request timed out" },
    { id: "pc10", label: "Sales-PC (VLAN 10)", kind: "pc", x: 520, y: 250, cfg: "IPv4 10.10.0.33/24\nGateway 10.10.0.1\nping 10.10.0.1 → Reply time<1ms" }
  ],
  links: [["fw", "core"], ["core", "acc", "trunk"], ["acc", "pc20"], ["acc", "pc10"]],
  a: "core",
  fixes: ["Add VLAN 20 to the trunk allowed list on Core-SW1 Gi1/0/24", "Change Acct-PC's gateway to 10.10.0.1", "Move Acct-PC's port to VLAN 10", "Replace the trunk cable", "Add a DNS server to Acct-PC"],
  fixA: "Add VLAN 20 to the trunk allowed list on Core-SW1 Gi1/0/24",
  fixWhy: "Both ends of a trunk must allow the VLAN. Core-SW1 only allows 10 and 30, so VLAN 20 frames are dropped at the core. <code>switchport trunk allowed vlan add 20</code> fixes it without disturbing the other VLANs.",
  nodeWhy: {
    core: "Its trunk to Access-SW2 allows only VLANs <b>10,30</b>. VLAN 20 is pruned, so VLAN 20 traffic never reaches the SVI.",
    acc: "Its uplink allows 10, 20 and 30, so this side is correct.",
    pc20: "The IP, mask and gateway are right for VLAN 20. It's the victim, not the cause.",
    pc10: "VLAN 10 works, which proves the trunk link itself is up.",
    fw: "The firewall is upstream of the core. Hosts can't even reach their gateway, so the firewall isn't involved yet."
  },
  clue: "<b>One VLAN broken across a trunk, others fine → check the allowed VLAN list on BOTH ends.</b>",
  trig: "Watch for 'switchport trunk allowed vlan' lines that are missing a VLAN in PBQ configs."
},
{
  id: "p-12", o: "3.4", type: "spot",
  title: "New VLAN gets APIPA addresses",
  setup: "<p>A new VLAN 30 (Labs) was created yesterday. Every PC in it shows <b>169.254.x.x</b>. VLAN 10 clients get DHCP addresses normally. The DHCP server already has a scope for 10.30.0.0/24 with free addresses.</p>",
  prompt: "Find the device that's misconfigured, then choose the fix.",
  nodes: [
    { id: "dhcp", label: "DHCP-01 (10.0.5.5)", kind: "server", x: 110, y: 60, cfg: "Scope 10.10.0.0/24  active  free: 112\nScope 10.30.0.0/24  active  free: 250\nOption 003 router: per scope\nService: running" },
    { id: "core", label: "Core-L3", kind: "L3 switch", x: 330, y: 60, cfg: "interface Vlan10\n ip address 10.10.0.1 255.255.255.0\n ip helper-address 10.0.5.5\n\ninterface Vlan30\n ip address 10.30.0.1 255.255.255.0\n no shutdown" },
    { id: "acc", label: "Access-SW3", kind: "switch", x: 330, y: 210, cfg: "Gi0/48 trunk allowed 10,30  connected\nGi0/1-24 access vlan 30\nGi0/25-47 access vlan 10" },
    { id: "lab", label: "Lab-PC", kind: "pc", x: 540, y: 210, cfg: "IPv4 169.254.88.14\nMask 255.255.0.0\nGateway (none)\nDHCP enabled: Yes" }
  ],
  links: [["dhcp", "core"], ["core", "acc", "trunk"], ["acc", "lab"]],
  a: "core",
  fixes: ["Add ip helper-address 10.0.5.5 under interface Vlan30", "Create a reservation for Lab-PC", "Add an exclusion range to the 10.30 scope", "Set Lab-PC to a static APIPA address", "Remove VLAN 30 from the trunk"],
  fixA: "Add ip helper-address 10.0.5.5 under interface Vlan30",
  fixWhy: "DHCP Discover is a broadcast and dies at the Layer 3 boundary. The Vlan30 SVI needs an <b>IP helper (DHCP relay)</b> to forward it to 10.0.5.5 as unicast, just like Vlan10 already has.",
  nodeWhy: {
    core: "Vlan10 has <code>ip helper-address</code>. <b>Vlan30 is missing it</b>, so broadcasts never reach the server.",
    dhcp: "The 10.30 scope exists, is active and has free leases. The server is fine. It just never hears the requests.",
    acc: "The trunk allows VLAN 30 and the access ports are in VLAN 30, so this switch is correct.",
    lab: "DHCP is enabled and it fell back to APIPA. That's the symptom, not the cause."
  },
  clue: "<b>One VLAN APIPA + server scope fine → missing IP helper on that VLAN's gateway.</b>",
  trig: "Compare a working SVI and a broken SVI line by line. The missing line is the answer."
},
{
  id: "p-13", o: "5.2", type: "spot",
  title: "Slow file server",
  setup: "<p>Users say copying files from <b>FS-01</b> is painfully slow. Other servers on the same switch are fast.</p>",
  prompt: "Find the device with the problem and choose the fix.",
  nodes: [
    { id: "fs", label: "FS-01", kind: "server", x: 110, y: 150, cfg: "NIC: Intel X550\nSpeed: 1000 Mb/s (forced)\nDuplex: Full (forced)\nErrors: 0" },
    { id: "sw", label: "DC-SW1", kind: "switch", x: 330, y: 150, cfg: "Gi1/0/7 (FS-01) is up, line protocol is up\n  a-100Mb/s, a-half-duplex\n  input errors 0, CRC 0\n  output: 4102 late collisions, 98113 collisions\n\nGi1/0/8 (WEB-01) is up\n  a-1000Mb/s, a-full-duplex\n  late collisions 0" },
    { id: "web", label: "WEB-01", kind: "server", x: 330, y: 40, cfg: "NIC: auto/auto → 1000/full\nErrors: 0" },
    { id: "core", label: "Core-L3", kind: "L3 switch", x: 550, y: 150, cfg: "Uplink to DC-SW1: 10G full, 0 errors\nCPU 8%" }
  ],
  links: [["fs", "sw", "Gi1/0/7"], ["web", "sw", "Gi1/0/8"], ["sw", "core", "10G"]],
  a: "sw",
  fixes: ["Set DC-SW1 Gi1/0/7 to 1000/full to match the server (or set both sides to auto)", "Replace FS-01's hard drive", "Enable jumbo frames on Core-L3", "Move FS-01 to VLAN 10", "Increase the uplink to 40G"],
  fixA: "Set DC-SW1 Gi1/0/7 to 1000/full to match the server (or set both sides to auto)",
  fixWhy: "The server is forced to 1000/full, so it doesn't negotiate. The switch port on auto falls back to <b>100/half</b>. Half duplex on one side and full on the other gives <b>late collisions</b> and terrible throughput. Make both sides match.",
  nodeWhy: {
    sw: "Gi1/0/7 negotiated <b>a-100/a-half</b>, with thousands of <b>late collisions</b>. That's the classic duplex-mismatch signature on the switch side.",
    fs: "Forced 1000/full is a legal setting. The mismatch comes from the switch side being left on auto. Matching either side fixes it, and the switch port is where the symptom shows.",
    web: "WEB-01 negotiated 1000/full with no errors, which proves the switch hardware is fine.",
    core: "The uplink is clean with low CPU. It isn't a bottleneck."
  },
  clue: "<b>'a-half' + late collisions = duplex mismatch. Hard-set one side → hard-set the other.</b>",
  trig: "In 'show interface' output, look for <b>half-duplex, late collisions, CRC, giants/runts</b>."
},
{
  id: "p-14", o: "4.3", type: "spot",
  title: "Websites by IP work, by name fail",
  setup: "<p>After last night's firewall change, users can reach <code>https://142.250.80.46</code> directly but can't open any website by name. The internal DNS server forwards queries to 1.1.1.1.</p>",
  prompt: "Find the misconfigured device and choose the fix.",
  nodes: [
    { id: "pc", label: "User-PC", kind: "pc", x: 90, y: 150, cfg: "IPv4 10.1.1.40/24\nGateway 10.1.1.1\nDNS 10.1.1.53\nnslookup google.com → DNS request timed out" },
    { id: "dns", label: "DNS-01 (10.1.1.53)", kind: "server", x: 280, y: 250, cfg: "Service: running\nForwarder: 1.1.1.1\nLocal zone corp.local: resolves fine\nExternal lookups: timing out" },
    { id: "sw", label: "Core-SW", kind: "L3 switch", x: 280, y: 60, cfg: "All ports up, no errors\nVLAN 1 SVI 10.1.1.1/24" },
    { id: "fw", label: "Edge-FW", kind: "firewall", x: 500, y: 150, cfg: "Outbound rules (top → bottom):\n 1 permit tcp 10.1.1.0/24 any eq 443\n 2 permit tcp 10.1.1.0/24 any eq 80\n 3 deny   udp any any eq 53\n 4 permit udp host 10.1.1.53 any eq 53\n 5 deny   ip any any" }
  ],
  links: [["pc", "sw"], ["sw", "dns"], ["sw", "fw"]],
  a: "fw",
  fixes: ["Move rule 4 (permit DNS from 10.1.1.53) above rule 3, or remove rule 3", "Change User-PC's DNS to 10.1.1.1", "Restart the DNS service", "Add a permit for TCP 3389", "Remove rule 5 (deny ip any any)"],
  fixA: "Move rule 4 (permit DNS from 10.1.1.53) above rule 3, or remove rule 3",
  fixWhy: "Firewalls read <b>top-down, first match wins</b>. Rule 3 denies <b>all</b> DNS before rule 4 can allow the DNS server's queries, so the forwarder never reaches 1.1.1.1. Put the specific permit above the broad deny.",
  nodeWhy: {
    fw: "Rule 3 (<b>deny udp any any eq 53</b>) matches before rule 4, so DNS forwarding is blocked. HTTPS by IP works because rules 1 and 2 allow it.",
    dns: "Internal zones resolve and the service runs. External lookups time out because the firewall blocks its forwarder traffic.",
    pc: "Settings are correct. DNS points at the internal server.",
    sw: "No errors, and IP traffic works, so switching and routing are fine."
  },
  no: "Removing rule 5 would open everything, which is a security failure. Changing the PC's DNS just moves the problem.",
  clue: "<b>IP works + names fail = DNS. After a firewall change, check rule ORDER.</b>",
  trig: "In ACL/firewall PBQs, find the <b>first</b> rule that matches the broken traffic."
},
{
  id: "p-15", o: "5.5", type: "match",
  title: "Read the interface output",
  setup: "<p>You ran <code>show interface</code> on five switch ports. Each excerpt points to one problem.</p>",
  prompt: "Match each output to the MOST likely problem.",
  options: ["Duplex mismatch", "MTU mismatch (jumbo frames on one side)", "Port err-disabled by BPDU guard", "Cable too long / attenuation or bad cable", "Port administratively shut down", "No problem"],
  rows: [
    { label: "<code>Gi0/3 is up · a-100Mb/s, a-half-duplex · 2311 late collisions</code>", a: "Duplex mismatch", why: "Half duplex plus <b>late collisions</b> is the signature of a duplex mismatch." },
    { label: "<code>Gi0/9 is up · 1000/full · 18402 giants · 0 CRC</code>", a: "MTU mismatch (jumbo frames on one side)", why: "<b>Giants</b> are frames larger than the MTU. The other side is sending jumbo frames." },
    { label: "<code>Gi0/12 is down, line protocol is down (err-disabled) · reason: bpduguard</code>", a: "Port err-disabled by BPDU guard", why: "The port received a BPDU, probably from a user's switch, and BPDU guard shut it." },
    { label: "<code>Gi0/15 is up · 1000/full · input errors 9120, CRC 9087 · run length 160 m</code>", a: "Cable too long / attenuation or bad cable", why: "CRC errors at <b>full duplex</b> (no collisions) mean a Layer 1 problem. 160 m is past the 100 m copper limit." },
    { label: "<code>Gi0/20 is administratively down, line protocol is down</code>", a: "Port administratively shut down", why: "'Administratively down' means someone typed <code>shutdown</code>. Fix it with <code>no shutdown</code>." },
    { label: "<code>Gi0/22 is up, line protocol is up · 1000/full · 0 errors</code>", a: "No problem", why: "Up/up, full duplex, no errors. This is a healthy port." }
  ],
  clue: "<b>Late collisions → duplex. Giants → MTU. CRC with no collisions → cable/Layer 1. 'Administratively down' → shutdown. err-disabled → a security feature fired.</b>",
  trig: "Memorize the <b>counter → cause</b> pairs. They show up in real PBQ outputs."
},
{
  id: "p-16", o: "5.5", type: "match",
  title: "Pick the right tool",
  setup: "<p>You're the on-site tech with a full toolbag. Pick the BEST tool for each job.</p>",
  prompt: "Choose a tool for each task.",
  options: ["Toner and probe", "Cable tester", "Visual fault locator (VFL)", "OTDR", "Optical light meter", "Wi-Fi analyzer", "Protocol analyzer", "Nmap", "Network TAP"],
  rows: [
    { label: "Find which of 48 unlabeled cables in the closet goes to desk 214", a: "Toner and probe", why: "Put tone on the wall jack and trace it with the probe in the closet." },
    { label: "Verify a newly crimped patch cable is wired correctly", a: "Cable tester", why: "Wire map: continuity, opens, shorts, miswires." },
    { label: "Find a break in a 3 m fiber patch cord by shining visible red light", a: "Visual fault locator (VFL)", why: "Red light leaks out at the break. Good for short runs." },
    { label: "Locate a fault 2.4 km down an outside fiber run", a: "OTDR", why: "An optical time-domain reflectometer measures the <b>distance</b> to breaks and splices on long fiber." },
    { label: "Measure dB loss on a fiber link", a: "Optical light meter", why: "It measures received optical power and loss." },
    { label: "Choose a non-overlapping channel for a new AP", a: "Wi-Fi analyzer", why: "Shows neighboring SSIDs, channels and signal strength." },
    { label: "Decode why a TLS handshake fails", a: "Protocol analyzer", why: "Wireshark or tcpdump show every packet and field." },
    { label: "Find all live hosts and open ports on a subnet", a: "Nmap", why: "An IP and port scanner." },
    { label: "Passively copy all full-duplex traffic on a link to an IDS without drops", a: "Network TAP", why: "A hardware TAP copies every frame in both directions." }
  ],
  clue: "<b>Copper: toner (find), tester (verify). Fiber: VFL (short, visible), OTDR (long, distance), light meter (dB). Wireless: analyzer. Packets: protocol analyzer.</b>",
  trig: "'Distance to fault on fiber' → <b>OTDR</b>. 'Visible red light' → <b>VFL</b>. 'Which cable' → <b>toner</b>."
},
{
  id: "p-17", o: "5.5", type: "match",
  title: "Pick the right command",
  setup: "<p>Choose the command a technician should run for each task.</p>",
  prompt: "Choose a command for each task.",
  options: ["ipconfig /all", "ping", "tracert", "nslookup", "arp -a", "netstat -ano", "show mac address-table", "show ip route", "show vlan brief", "show interface", "show power inline", "tcpdump"],
  rows: [
    { label: "See a Windows PC's IP, mask, gateway, DNS servers and DHCP status", a: "ipconfig /all", why: "Shows the full local IP configuration." },
    { label: "Test basic reachability to the gateway", a: "ping", why: "ICMP echo, the quickest up/down test." },
    { label: "Find which hop drops traffic to a remote site", a: "tracert", why: "Lists each hop along the path." },
    { label: "Check what IP the DNS server returns for a name", a: "nslookup", why: "Queries DNS directly." },
    { label: "See the MAC the PC has cached for its gateway", a: "arp -a", why: "Shows the ARP cache." },
    { label: "See which process is listening on TCP 443", a: "netstat -ano", why: "Connections, ports and the owning PID." },
    { label: "Find which switch port a MAC address is on", a: "show mac address-table", why: "The switch's MAC-to-port table." },
    { label: "Check whether the router knows a path to 10.9.0.0/16", a: "show ip route", why: "The routing table." },
    { label: "Confirm which VLAN port Gi0/12 is in", a: "show vlan brief", why: "VLANs and their assigned ports." },
    { label: "Check a port's speed, duplex and CRC errors", a: "show interface", why: "Status and error counters." },
    { label: "Check how much of the PoE budget is in use", a: "show power inline", why: "PoE budget and per-port draw." },
    { label: "Capture packets on a headless Linux server", a: "tcpdump", why: "Command-line packet capture." }
  ],
  clue: "<b>PC side: ipconfig, ping, tracert, nslookup, arp, netstat. Switch side: show mac / vlan / interface / power. Router: show ip route.</b>",
  trig: "Match the <b>noun</b> in the task to the command: route → show ip route, VLAN → show vlan, MAC → show mac, port errors → show interface."
},
{
  id: "p-18", o: "1.1", type: "order",
  title: "OSI model",
  setup: "<p>A technician is troubleshooting bottom-up through the OSI model.</p>",
  prompt: "Order the layers from Layer 1 (bottom) to Layer 7 (top).",
  items: [
    { t: "Physical: cables, connectors, signals, hubs", why: "Bits on the wire. Check link lights and cables here." },
    { t: "Data link: MAC addresses, switches, frames", why: "Layer 2. Frames, MAC addresses, VLANs, STP." },
    { t: "Network: IP addresses, routers, packets", why: "Layer 3. Routing, IP, ICMP." },
    { t: "Transport: TCP/UDP, ports, segments", why: "Layer 4. Ports, reliability, flow control." },
    { t: "Session: setting up and tearing down conversations", why: "Layer 5. Dialog control between apps." },
    { t: "Presentation: encryption, encoding, compression", why: "Layer 6. Data format and translation." },
    { t: "Application: HTTP, DNS, SMTP (the network interface for apps)", why: "Layer 7. Protocols that apps use." }
  ],
  clue: "<b>Bottom-up: 'Please Do Not Throw Sausage Pizza Away'</b>. Top-down: 'All People Seem To Need Data Processing'.",
  trig: "Bottom-up troubleshooting starts at <b>Physical</b>. Top-down starts at <b>Application</b>."
},
{
  id: "p-19", o: "1.7", type: "match",
  title: "VLSM subnet plan",
  setup: "<p>Split <b>192.168.50.0/24</b> for four needs, <b>largest first</b>, with no overlap and the least waste: Sales needs 100 hosts, HR 50 hosts, IT 25 hosts, and the WAN link 2 hosts.</p>",
  prompt: "Choose the subnet for each department.",
  rows: [
    { label: "Sales (100 hosts)", a: "192.168.50.0/25", options: ["192.168.50.0/24", "192.168.50.0/25", "192.168.50.0/26", "192.168.50.128/25"], why: "100 hosts needs 7 host bits (126 usable) → /25. Start at .0, covering .0–.127." },
    { label: "HR (50 hosts)", a: "192.168.50.128/26", options: ["192.168.50.64/26", "192.168.50.128/26", "192.168.50.128/27", "192.168.50.192/26"], why: "50 hosts needs 6 host bits (62 usable) → /26. Next free block: .128–.191." },
    { label: "IT (25 hosts)", a: "192.168.50.192/27", options: ["192.168.50.192/27", "192.168.50.192/28", "192.168.50.160/27", "192.168.50.224/27"], why: "25 hosts needs 5 host bits (30 usable) → /27. Next free block: .192–.223." },
    { label: "WAN link (2 hosts)", a: "192.168.50.224/30", options: ["192.168.50.224/30", "192.168.50.224/29", "192.168.50.192/30", "192.168.50.255/30"], why: "2 hosts → /30. Next free block: .224–.227." }
  ],
  clue: "<b>VLSM = biggest subnet first, then pack the next one right after it.</b> Hosts: /25=126, /26=62, /27=30, /28=14, /29=6, /30=2.",
  trig: "Always <b>sort by size, descending</b>. Starting with the small subnets causes overlap and gaps."
},
{
  id: "p-20", o: "1.3", type: "match",
  title: "Build the cloud network",
  setup: "<p>You're designing a VPC for a web app: public web servers, private app and database servers, a link to the on-prem data center, and a second VPC owned by the analytics team.</p>",
  prompt: "Choose the cloud component for each requirement.",
  options: ["Internet gateway", "NAT gateway", "Network security group", "Network security list (NACL)", "Direct Connect", "Site-to-site VPN", "VPC peering"],
  rows: [
    { label: "Web subnet must be reachable from the internet (two-way)", a: "Internet gateway", why: "Two-way internet access for public subnets." },
    { label: "Database servers must download patches but accept no inbound internet connections", a: "NAT gateway", why: "Outbound-only internet for private subnets." },
    { label: "Allow only 443 to one specific web instance; return traffic automatic", a: "Network security group", why: "Stateful, at the instance/NIC level." },
    { label: "Block a malicious IP range for the whole subnet; stateless rules", a: "Network security list (NACL)", why: "Stateless, at the subnet level." },
    { label: "Dedicated private circuit to the data center, not over the internet", a: "Direct Connect", why: "Private, consistent latency." },
    { label: "Quick encrypted link to the data center over the internet", a: "Site-to-site VPN", why: "IPsec over the internet. Cheap and fast to set up." },
    { label: "Private routing between this VPC and the analytics VPC", a: "VPC peering", why: "Connects two VPCs privately." }
  ],
  clue: "<b>IGW = two-way door. NAT GW = exit only. Security group = per server, stateful. Security list = per subnet, stateless. Direct Connect = private road. VPN = tunnel over the internet. Peering = VPC-to-VPC.</b>",
  trig: "'Stateful/instance' → security group. 'Stateless/subnet' → security list. 'Not over internet' → Direct Connect."
},
{
  id: "p-21", o: "4.3", type: "match",
  title: "Replace insecure protocols",
  setup: "<p>An audit flagged clear-text protocols on your network. Pick the secure replacement for each one.</p>",
  prompt: "Choose the secure replacement.",
  options: ["SSH (22)", "HTTPS (443)", "SFTP (22)", "LDAPS (636)", "SNMPv3", "SIP over TLS (5061)", "SMTP with TLS submission (587)", "DNS over TLS (853)"],
  rows: [
    { label: "Telnet (23) for switch CLI", a: "SSH (22)", why: "Encrypted remote CLI." },
    { label: "HTTP (80) for the admin web page", a: "HTTPS (443)", why: "HTTP inside TLS." },
    { label: "FTP (20/21) for config backups", a: "SFTP (22)", why: "File transfer over SSH." },
    { label: "LDAP (389) directory lookups", a: "LDAPS (636)", why: "LDAP over TLS." },
    { label: "SNMPv2c with community 'public'", a: "SNMPv3", why: "Adds authentication and encryption." },
    { label: "SIP (5060) call signaling", a: "SIP over TLS (5061)", why: "Encrypted VoIP signaling." },
    { label: "SMTP (25) client mail submission", a: "SMTP with TLS submission (587)", why: "CompTIA lists SMTPS as 587." },
    { label: "Plain DNS (53) queries readable by the ISP", a: "DNS over TLS (853)", why: "Encrypts DNS queries (DoH uses 443)." }
  ],
  clue: "<b>Secure twins: 23→22, 80→443, 21→22 (SFTP), 389→636, v2c→v3, 5060→5061, 25→587, 53→853.</b>",
  trig: "Hardening PBQs: <b>replace every clear-text protocol with its secure twin</b>, and disable the old one."
}
);
