/* Study & Test question bank, Domain 2 "twins". Format: see d1.js. */
(window.NP_EXAM = window.NP_EXAM || { mc: [], pbq: [] }).mc.push(
{
  id: "t2-01", o: "2.1",
  q: "A router learns 10.50.0.0/16 from a static route and also from OSPF, with the same prefix length. Which route goes into the routing table?",
  c: ["The OSPF route, because OSPF is dynamic", "The static route, because its administrative distance (1) is lower than OSPF's (110)", "Both, load-balanced", "Whichever has the lower metric"],
  a: 1,
  why: "Same prefix from <b>different sources</b> → the router compares <b>administrative distance</b>, and lower wins. Static = 1, OSPF = 110, so the <b>static</b> route wins.",
  no: ["Being dynamic doesn't make a route preferred. AD decides.", "", "Load balancing happens across equal routes from the <b>same</b> protocol, not across different protocols.", "Metrics only compare routes <b>within one</b> protocol. AD is checked first."],
  clue: "Tie-breaker order: <b>1) longest prefix → 2) lowest AD → 3) lowest metric.</b> AD list: Connected 0, Static 1, eBGP 20, EIGRP 90, OSPF 110, iBGP 200.",
  trig: "'Same prefix, different protocols' → <b>administrative distance</b>. 'Different prefix lengths' → <b>longest match</b>."
},
{
  id: "t2-02", o: "2.1",
  q: "A router's table contains 0.0.0.0/0, 172.16.0.0/16, 172.16.8.0/22 and 172.16.8.0/24. A packet arrives for 172.16.9.5. Which route is used?",
  c: ["0.0.0.0/0", "172.16.0.0/16", "172.16.8.0/22", "172.16.8.0/24"],
  a: 2,
  why: "172.16.8.0/24 only covers 8.0–8.255, so <b>9.5 doesn't match</b> it. 172.16.8.0/22 covers 8.0–11.255, so 9.5 <b>matches</b>. That makes the /22 the <b>longest matching</b> prefix.",
  no: ["The default route matches everything, but it's the shortest prefix and only used when nothing else matches.", "/16 matches, but /22 is longer and more specific.", "", "/24 is longest, but it <b>doesn't contain</b> 172.16.9.5. That's the trap."],
  clue: "<b>Longest match only counts if it actually matches.</b> Check the range first, then pick the longest.",
  trig: "Routing table plus a destination IP → work out each route's range, then pick the <b>longest one that contains it</b>."
},
{
  id: "t2-03", o: "2.1",
  q: "A company has its own public IP block and connects to two different ISPs. It must advertise its prefix to both and choose paths between autonomous systems. Which protocol is required?",
  c: ["OSPF", "EIGRP", "BGP", "Static default routes"],
  a: 2,
  why: "<b>BGP</b> is the protocol of the internet. It exchanges routes <b>between autonomous systems</b>, which is what multihoming to several ISPs requires.",
  no: ["OSPF is an <b>interior</b> protocol, used inside one organization.", "EIGRP is also interior (Cisco).", "", "Static defaults can't advertise your prefix to the ISPs or make policy-based path choices."],
  clue: "<b>BGP = Border Gateway = the border between companies/ISPs.</b>",
  trig: "'Multihomed', 'two ISPs', 'autonomous systems', 'advertise our prefix' → <b>BGP</b>."
},
{
  id: "t2-04", o: "2.1",
  q: "An all-Cisco network wants an interior routing protocol that converges very fast and is described as an advanced distance-vector (hybrid) protocol. Which fits?",
  c: ["OSPF", "EIGRP", "BGP", "RIP"],
  a: 1,
  why: "<b>EIGRP</b> is Cisco's <b>advanced distance-vector/hybrid</b> protocol. It converges fast and has an AD of 90.",
  no: ["OSPF is link-state, not hybrid.", "", "BGP is exterior path-vector.", "RIP is old, slow distance-vector with a 15-hop limit, and it isn't on the N10-009 objectives."],
  clue: "<b>EIGRP = 'Enhanced', Cisco's hybrid.</b> Link-state = OSPF. Path-vector = BGP.",
  trig: "'Hybrid', 'advanced distance vector', 'Cisco' → <b>EIGRP</b>."
},
{
  id: "t2-05", o: "2.1",
  q: "Two routers share the virtual IP 10.0.0.1 that every host uses as its default gateway. One router is active and the other takes over within seconds if it fails, and hosts never change their settings. What is configured?",
  c: ["VRRP (an FHRP)", "OSPF", "LACP", "Spanning Tree"],
  a: 0,
  why: "A <b>first-hop redundancy protocol</b> (VRRP, or Cisco's HSRP) presents one <b>virtual gateway IP</b> backed by several routers, so the gateway survives a router failure.",
  no: ["", "OSPF provides redundant <b>paths</b> between routers, but hosts still need one gateway IP that never fails. That's FHRP's job.", "LACP bundles links.", "STP prevents Layer 2 loops."],
  clue: "<b>FHRP = a spare gateway with the same phone number.</b> VRRP is the open standard, HSRP is Cisco's.",
  trig: "'Virtual IP', 'default gateway redundancy', 'active/standby router' → <b>FHRP (VRRP/HSRP)</b>."
},
{
  id: "t2-06", o: "2.2",
  q: "On an 802.1Q trunk, a switch receives a frame with no VLAN tag. Which VLAN does it place the frame in?",
  c: ["VLAN 0", "The native VLAN", "The voice VLAN", "The management VLAN, always"],
  a: 1,
  why: "Untagged frames on a trunk belong to the <b>native VLAN</b> (VLAN 1 by default). Both ends must agree, or traffic leaks between VLANs.",
  no: ["VLAN 0 isn't used for this. It's reserved for priority tagging.", "", "The voice VLAN applies to access ports with phones.", "The management VLAN is whatever you configure. It isn't automatically where untagged trunk frames go."],
  clue: "<b>Native = 'naked' (untagged).</b> Best practice: change it from VLAN 1 to an unused VLAN.",
  trig: "'Untagged on a trunk' → <b>native VLAN</b>. 'Native VLAN mismatch' → traffic leaks, CDP/STP warnings."
},
{
  id: "t2-07", o: "2.2",
  q: "A switch port connects a single desktop PC and should carry traffic for one VLAN only, without tags. How should the port be configured?",
  c: ["Trunk port", "Access port", "Mirrored (SPAN) port", "Routed port"],
  a: 1,
  why: "An <b>access port</b> belongs to <b>one VLAN</b> and sends frames <b>untagged</b>. It's what end devices plug into.",
  no: ["A trunk carries <b>many</b> VLANs with tags, for switch-to-switch or switch-to-router links.", "", "SPAN copies traffic to an analyzer.", "A routed port is a Layer 3 interface with an IP, used on multilayer switches for router links."],
  clue: "<b>Access = one VLAN, one device. Trunk = many VLANs, tagged.</b>",
  trig: "'End device', 'one VLAN', 'untagged' → <b>access</b>. 'Multiple VLANs between switches' → <b>trunk</b>."
},
{
  id: "t2-08", o: "2.2",
  q: "An old access switch keeps getting elected as the STP root bridge, which sends traffic along poor paths. The admin wants the core switch to always be root. What should be done?",
  c: ["Raise the core switch's bridge priority to 61440", "Lower the core switch's bridge priority (e.g., 4096)", "Disable STP on the access switch", "Enable PortFast on the core uplinks"],
  a: 1,
  why: "The <b>lowest bridge ID</b> (priority, then MAC) wins the root election. <b>Lowering the core's priority</b> guarantees it wins. The default is 32768.",
  no: ["A higher priority makes the core <b>less</b> likely to be root.", "", "Disabling STP invites switching loops and broadcast storms.", "PortFast skips listening and learning on <b>edge</b> ports. Using it on uplinks is dangerous, and it doesn't affect the root election."],
  clue: "<b>Root bridge = the lowest number wins</b>, like golf.",
  trig: "'Wrong root bridge', 'make X root' → <b>lower bridge priority on X</b>."
},
{
  id: "t2-09", o: "2.2",
  q: "Two switches are connected by two 10G links. Without any special configuration, STP blocks one link. The admin wants both links active as one 20G logical link. What should be configured?",
  c: ["A second VLAN", "Link aggregation with LACP (port channel)", "PortFast", "Jumbo frames"],
  a: 1,
  why: "<b>LACP (802.3ad)</b> bundles the links into one <b>logical port channel</b>. STP sees a single link, so nothing gets blocked, and you get more bandwidth plus failover.",
  no: ["Another VLAN doesn't combine physical links.", "", "PortFast is for edge ports.", "Jumbo frames change frame size, not the number of active links."],
  clue: "<b>LACP = 'Link Aggregation': many cables, one pipe.</b>",
  trig: "'Bundle links', 'more bandwidth + redundancy', 'port channel/EtherChannel' → <b>LACP</b>."
},
{
  id: "t2-10", o: "2.2",
  q: "An IP phone is plugged into the wall and a PC plugs into the phone. The switch port must put phone traffic in tagged VLAN 50 and PC traffic in untagged VLAN 10. What feature is needed?",
  c: ["Voice VLAN on the access port", "Native VLAN 50 on a trunk", "Port mirroring", "Private VLAN"],
  a: 0,
  why: "A <b>voice VLAN</b> lets one access port carry the phone's traffic <b>tagged</b> in a voice VLAN (for QoS) and the PC's traffic <b>untagged</b> in the data VLAN.",
  no: ["", "Making the port a trunk with native 50 would put the <b>PC</b> in VLAN 50, which is backwards and unnecessary.", "Mirroring copies traffic for analysis.", "Private VLANs isolate ports from each other inside one VLAN."],
  clue: "<b>Voice VLAN = two lanes on one port</b>: the phone in the carpool lane, the PC in the regular lane.",
  trig: "'IP phone + PC on one port', 'separate voice traffic' → <b>voice VLAN</b>."
},
{
  id: "t2-11", o: "2.3",
  q: "A warehouse can't run cable to its far side. The company installs APs that connect to each other wirelessly and relay traffic back to the one wired AP. What type of wireless network is this?",
  c: ["Ad hoc", "Mesh", "Point-to-point bridge", "Infrastructure with all-wired APs"],
  a: 1,
  why: "In a <b>mesh</b>, APs link to <b>each other</b> wirelessly as backhaul and pass traffic along to a wired root AP. It's great where cabling is hard.",
  no: ["Ad hoc is client-to-client with <b>no APs</b>.", "", "A point-to-point bridge links exactly two sites with directional antennas.", "The question says these APs aren't wired."],
  clue: "<b>Mesh = APs holding hands</b> to reach the one that's plugged in.",
  trig: "'APs connect wirelessly to each other', 'no cabling', 'self-healing' → <b>mesh</b>."
},
{
  id: "t2-12", o: "2.3",
  q: "Two laptops in a field office connect directly to each other over Wi-Fi to share a file. No access point is involved. What mode is this?",
  c: ["Infrastructure mode", "Ad hoc (IBSS)", "Mesh", "Extended service set"],
  a: 1,
  why: "<b>Ad hoc</b> (independent BSS) means devices connect <b>peer-to-peer</b> with <b>no AP</b>.",
  no: ["Infrastructure mode requires an AP.", "", "Mesh uses APs relaying for each other.", "An ESS is several APs sharing one SSID."],
  clue: "<b>Ad hoc = 'for this purpose'</b>: a quick, temporary connection, no AP.",
  trig: "'No access point', 'device to device', 'peer-to-peer Wi-Fi' → <b>ad hoc</b>."
},
{
  id: "t2-13", o: "2.3",
  q: "A new 2.4 GHz AP is being installed next to an existing AP on channel 6. Which channel should the new AP use to avoid overlap?",
  c: ["5", "7", "11", "6"],
  a: 2,
  why: "In the US, only <b>1, 6 and 11</b> don't overlap on 2.4 GHz. The neighbor uses 6, so pick <b>11</b> (or 1).",
  no: ["Channel 5 overlaps heavily with 6.", "Channel 7 overlaps heavily with 6.", "", "Using 6 as well creates co-channel interference, so the APs have to take turns."],
  clue: "<b>1-6-11.</b> Channels are 5 MHz apart but about 20 MHz wide, so you need a gap of 5.",
  trig: "'2.4 GHz', 'avoid overlap', 'neighboring AP' → <b>1, 6 or 11</b>."
},
{
  id: "t2-14", o: "2.3",
  q: "A manager proposes hiding (not broadcasting) the corporate SSID as the main way to secure the wireless network. What is the BEST response?",
  c: ["It's strong security because attackers can't find the network", "It's minimal security; the SSID is still visible in client probe traffic, so use WPA3 encryption and authentication", "It's required by WPA3", "It makes the network faster"],
  a: 1,
  why: "A hidden SSID still appears in <b>probe requests and responses</b>. Any Wi-Fi analyzer finds it. Real security comes from <b>WPA3/WPA2 encryption + authentication</b>.",
  no: ["Hiding the SSID is 'security through obscurity'. It stops casual users, not attackers.", "", "WPA3 doesn't require a hidden SSID.", "Hiding the SSID doesn't improve speed."],
  clue: "<b>Hiding the SSID = taking the house number off the door.</b> The door still needs a lock (WPA3).",
  trig: "'Hide SSID', 'MAC filtering' as security → <b>weak / obscurity</b>. Real answer: <b>WPA3 + 802.1X</b>."
},
{
  id: "t2-15", o: "2.4",
  q: "A data center must keep running through a two-day utility outage after a storm. Which combination provides this?",
  c: ["A UPS alone", "A UPS to bridge the gap plus a generator for long-term power", "A managed PDU", "Dual power supplies on each server"],
  a: 1,
  why: "A <b>UPS</b> carries the load for seconds to minutes while the <b>generator</b> starts. The generator then runs for <b>hours to days</b> on fuel.",
  no: ["A UPS battery lasts minutes, not days.", "", "A PDU distributes power but doesn't generate it.", "Dual PSUs protect against a failed power supply, not a utility outage."],
  clue: "<b>UPS = the sprint (minutes). Generator = the marathon (days).</b>",
  trig: "'Long outage', 'hours/days' → <b>generator</b>. 'Brief outage', 'clean shutdown', 'bridge to generator' → <b>UPS</b>."
},
{
  id: "t2-16", o: "2.4",
  q: "A server is listed as 2U. How much vertical rack space does it take?",
  c: ["1.75 inches", "2 inches", "3.5 inches", "4 inches"],
  a: 2,
  why: "<b>1U = 1.75 inches</b> (44.45 mm). 2U = 2 × 1.75 = <b>3.5 inches</b>.",
  no: ["1.75 inches is 1U.", "There's no 2-inch rack unit.", "", "4 inches doesn't match any number of rack units."],
  clue: "<b>1U = 1¾\".</b> A standard full rack is 42U, about 6 feet.",
  trig: "'Rack unit', 'U' → <b>1.75 inches each</b>."
},
{
  id: "t2-17", o: "2.4",
  q: "Horizontal cables from office wall jacks run back to the IDF. Where do they terminate so short patch cables can connect them to switch ports?",
  c: ["Directly into the switch", "A patch panel", "A fiber distribution panel", "A PDU"],
  a: 1,
  why: "Copper runs are punched down on the back of a <b>patch panel</b>. Short patch cords then connect panel ports to switch ports, which makes moves and changes easy.",
  no: ["Terminating solid cable directly into switches is fragile and makes changes hard.", "", "A fiber distribution panel terminates <b>fiber</b>, not copper from wall jacks.", "A PDU distributes power."],
  clue: "<b>Patch panel = a switchboard for cables.</b> Permanent runs on the back, flexible patches on the front.",
  trig: "'Horizontal cabling terminates', 'punch down', 'wall jacks to IDF' → <b>patch panel</b>. Fiber → <b>fiber distribution panel</b>."
},
{
  id: "t2-18", o: "2.2",
  q: "An iSCSI storage network will move large blocks of data between servers and storage. Which change improves efficiency, and what is its requirement?",
  c: ["Enable jumbo frames (MTU ~9000) on every device in the path", "Lower the MTU to 576 on the servers", "Enable PortFast on every port", "Use half duplex to avoid collisions"],
  a: 0,
  why: "<b>Jumbo frames</b> carry more data per frame, which means less overhead and less CPU load for bulk storage traffic. The MTU must match <b>end to end</b>, or frames get dropped or fragmented.",
  no: ["", "A smaller MTU means more frames and more overhead. That's worse.", "PortFast affects STP timing on edge ports, not efficiency.", "Half duplex lowers throughput, and modern switched links don't have collisions anyway."],
  clue: "<b>Jumbo = a bigger truck, fewer trips.</b> Every bridge on the route has to fit the truck (same MTU on every device).",
  trig: "'Storage/iSCSI', 'large transfers', 'efficiency' → <b>jumbo frames, end to end</b>. 'Giants' errors → MTU mismatch."
}
);
