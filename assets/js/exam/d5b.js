/* Study & Test question bank, Domain 5 "twins" (the biggest domain, 24%). Format: see d1.js. */
(window.NP_EXAM = window.NP_EXAM || { mc: [], pbq: [] }).mc.push(
{
  id: "t5-01", o: "5.1",
  q: "While gathering information, a technician asks the user, 'Did anything change before this started, like an update, a move, or new equipment?' Which troubleshooting step is this part of?",
  c: ["Identify the problem", "Establish a theory of probable cause", "Test the theory", "Verify full system functionality"],
  a: 0,
  why: "'<b>Determine if anything has changed</b>' is one of the listed tasks in step 1, <b>identify the problem</b>, along with questioning users, identifying symptoms and duplicating the problem.",
  no: ["", "Theory comes after gathering information. You form a guess based on the answers.", "Testing confirms or rejects a theory you already have.", "Verification happens after the fix."],
  clue: "Step 1 checklist: <b>gather info, question users, symptoms, what changed, duplicate, one problem at a time.</b>",
  trig: "'Questions the user', 'what changed', 'reproduce the issue' → <b>identify the problem</b>."
},
{
  id: "t5-02", o: "5.1",
  q: "A technician's theory is confirmed: the ISP's equipment at the demarc has failed. The technician has no access to fix ISP equipment. What should happen NEXT?",
  c: ["Establish a new theory", "Escalate to the ISP, following the plan of action", "Replace the ISP's router with a spare", "Document and close the ticket"],
  a: 1,
  why: "When the fix is <b>outside your control or authority</b>, the step is '<b>implement the solution or escalate as necessary</b>'. Open a ticket with the ISP.",
  no: ["The theory was <b>confirmed</b>, so you don't need a new one.", "", "You can't change equipment you don't own or control.", "Documenting and closing comes after the problem is resolved and verified."],
  clue: "<b>Can't fix it yourself? Escalate.</b> Escalation is part of step 5, not a failure.",
  trig: "'Outside our control', 'vendor/ISP equipment', 'no access' → <b>escalate</b>."
},
{
  id: "t5-03", o: "5.1",
  q: "A whole department lost network access. While forming a theory, the technician first checks whether the department's switch has power and its uplink is plugged in. Which part of the methodology is this?",
  c: ["Question the obvious", "Duplicate the problem", "Implement preventive measures", "Document lessons learned"],
  a: 0,
  why: "'<b>Question the obvious</b>' is part of step 2 (establish a theory). Check the simple things first: power, cables, link lights.",
  no: ["", "Duplicating the problem is step 1, reproducing what the user sees.", "Preventive measures come in step 6, after the fix.", "Lessons learned come in step 7."],
  clue: "<b>'Is it plugged in?' is a real step.</b> It's quick to rule out.",
  trig: "'Check power/cables first', 'simple causes' → <b>question the obvious</b> (theory step)."
},
{
  id: "t5-04", o: "5.2",
  q: "A server NIC is hard-set to 1000 Mbps full duplex, but the switch port shows 100 Mbps half duplex, with rising late collisions. What is the problem and the fix?",
  c: ["Attenuation; shorten the cable", "Speed/duplex mismatch; set both sides to match (or both to auto)", "VLAN mismatch; change the VLAN", "PoE budget; disable PoE"],
  a: 1,
  why: "When one side is hard-coded and the other is on auto, autonegotiation fails, and the auto side falls back to <b>half duplex</b>. That causes <b>late collisions</b> and CRC errors. Make both sides match.",
  no: ["Attenuation would show as errors on a long run, not a negotiated 100 half.", "", "A VLAN mismatch breaks reachability. It doesn't cause collisions.", "PoE doesn't affect duplex."],
  clue: "<b>Hard-set one side = hard-set both sides.</b> Half duplex + late collisions = duplex mismatch.",
  trig: "'Late collisions', 'half duplex', 'one side hard-coded' → <b>duplex mismatch</b>."
},
{
  id: "t5-05", o: "5.2",
  q: "A cable tester shows that the wires on pins 3 and 6 are electrically connected to each other inside the cable. What fault is this?",
  c: ["Open", "Short", "Split pair", "Attenuation"],
  a: 1,
  why: "A <b>short</b> is two conductors touching when they shouldn't, creating an unintended path.",
  no: ["An open is a <b>broken</b> conductor with no connection.", "", "A split pair has the pins connected correctly end to end but in the wrong twisted pairs.", "Attenuation is signal loss over distance."],
  clue: "<b>Short = a shortcut between two wires.</b> Open = a gap in one wire.",
  trig: "'Wires connected to each other', 'touching' → <b>short</b>. 'No continuity' → <b>open</b>."
},
{
  id: "t5-06", o: "5.2",
  q: "A PC has no link light. The technician moves the same patch cable to a different switch port and the link comes up immediately. What is the MOST likely cause?",
  c: ["Bad switch port", "Bad patch cable", "Wrong VLAN", "DNS failure"],
  a: 0,
  why: "The <b>same cable</b> works on another port, so the cable is fine. The original <b>port</b> is bad, or err-disabled or shut down. Check its status.",
  no: ["", "The cable works on the new port, which rules it out.", "A VLAN problem wouldn't stop the <b>link light</b>, which is Layer 1.", "DNS has nothing to do with link lights."],
  clue: "<b>Swap one thing at a time.</b> Same cable, new port works → old port bad.",
  trig: "'Works on another port' → <b>bad port</b>. 'Works with another cable' → <b>bad cable</b>."
},
{
  id: "t5-07", o: "5.2",
  q: "After adding six new PoE cameras, several existing phones on the same switch randomly reboot. Which command BEST confirms the cause?",
  c: ["show vlan", "show power inline", "show ip route", "show mac address-table"],
  a: 1,
  why: "Phones rebooting after more PoE devices were added points to an exceeded <b>PoE power budget</b>. <b>show power inline</b> (or 'show power') shows the budget, how much is used, and per-port draw.",
  no: ["show vlan lists VLAN membership.", "", "show ip route shows routes.", "The MAC table shows learned addresses, not power."],
  clue: "<b>PoE problems → 'show power'.</b> Watch both the total budget and per-port class.",
  trig: "'PoE devices rebooting/denied', 'added more PoE' → <b>budget exceeded → show power inline</b>."
},
{
  id: "t5-08", o: "5.3",
  q: "A PC is set to 192.168.4.25/24 with gateway 192.168.4.254, but the router's LAN interface is 192.168.4.1. The PC can reach local printers but nothing on other networks. What is wrong?",
  c: ["Subnet mask", "Default gateway", "DNS server", "DHCP lease"],
  a: 1,
  why: "Local traffic doesn't use the gateway, so it works. <b>Remote</b> traffic is sent to .254, which doesn't exist. Set the gateway to <b>.1</b>.",
  no: ["The mask (/24) matches the network.", "", "DNS would affect names, not reaching remote IPs.", "The PC has a valid address, so the lease isn't the issue."],
  clue: "<b>Local works + remote fails = gateway.</b>",
  trig: "'Can reach local, not remote/internet' → <b>default gateway</b>."
},
{
  id: "t5-09", o: "5.3",
  q: "Switch logs show the same MAC addresses constantly 'flapping' between two ports. Broadcast traffic is at 90% and CPUs are pegged. What is happening?",
  c: ["DHCP exhaustion", "A switching loop (STP failure), causing a broadcast storm", "Duplex mismatch", "DNS poisoning"],
  a: 1,
  why: "Frames circling a <b>Layer 2 loop</b> make MACs appear on different ports again and again (<b>MAC flapping</b>), and broadcasts multiply into a <b>storm</b>. Find the loop and make sure STP is running.",
  no: ["DHCP exhaustion gives clients APIPA addresses, not storms.", "", "Duplex mismatch causes errors on one link, not network-wide storms.", "DNS poisoning sends users to wrong IPs."],
  clue: "<b>MAC flapping + broadcast storm = loop.</b> Ethernet has no TTL, so frames circle forever.",
  trig: "'MAC flapping', 'broadcast storm', 'CPU 100%', 'new cable between switches' → <b>switching loop / STP</b>."
},
{
  id: "t5-10", o: "5.3",
  q: "An ACL reads: 1) permit ip any any 2) deny tcp any any eq 23. Telnet traffic is still getting through. Why?",
  c: ["ACLs ignore TCP", "Rule 1 matches first, so rule 2 is never reached", "The implicit deny overrides rule 1", "Telnet uses UDP"],
  a: 1,
  why: "ACLs are processed <b>top-down, first match wins</b>. 'permit ip any any' matches <b>everything</b>, so the deny below it never runs. Move the deny above the permit.",
  no: ["ACLs can filter on TCP and UDP ports.", "", "The implicit deny only applies if <b>nothing</b> matched. Here rule 1 always matches.", "Telnet is TCP 23."],
  clue: "<b>Specific before general.</b> Put a broad permit at the top and nothing below it ever runs.",
  trig: "'Deny rule not working', 'rule order' → <b>first match wins → reorder</b>."
},
{
  id: "t5-11", o: "5.3",
  q: "A traceroute to a remote server shows the same two router IPs repeating over and over until the hop limit is reached. What is the problem?",
  c: ["Switching loop", "Routing loop", "DNS failure", "MTU mismatch"],
  a: 1,
  why: "Packets bouncing between the <b>same routers</b> until the TTL runs out is a <b>routing loop</b>, usually from bad static routes or redistribution.",
  no: ["A switching loop is Layer 2. It shows as storms and MAC flapping, and traceroute doesn't show it this way.", "", "DNS failures stop names from resolving. They don't make hops repeat.", "MTU problems cause drops of large packets, not repeating hops."],
  clue: "<b>Traceroute ping-pong = routing loop.</b> TTL eventually kills the packets.",
  trig: "'Same hops repeating in traceroute', 'TTL exceeded' → <b>routing loop</b>."
},
{
  id: "t5-12", o: "5.3",
  q: "Hosts in VLAN 40 on Switch B can't reach their gateway on Switch A. Hosts in VLANs 10 and 20 on Switch B work fine across the same trunk. What is MOST likely wrong?",
  c: ["VLAN 40 isn't in the trunk's allowed VLAN list (or doesn't exist on one switch)", "The trunk cable is bad", "STP has blocked all ports", "DNS is misconfigured"],
  a: 0,
  why: "Only <b>one VLAN</b> fails across a trunk that works for the others. That means VLAN 40 is <b>pruned or not allowed</b> on the trunk, or wasn't created on one of the switches.",
  no: ["", "A bad cable would break all VLANs, not just one.", "STP blocking would affect every VLAN on that link, or there'd be a redundant path.", "DNS doesn't affect reaching the gateway by IP."],
  clue: "<b>One VLAN broken, others fine → check the trunk's allowed list.</b>",
  trig: "'Only one VLAN fails across a trunk' → <b>allowed VLAN list / VLAN missing</b>. Check with 'show interfaces trunk'."
},
{
  id: "t5-13", o: "5.4",
  q: "During video calls, ping times to the conferencing server swing between 20 ms and 180 ms, and audio is choppy. Bandwidth use is low. What is the issue, and what helps MOST?",
  c: ["Latency; buy a faster link", "Jitter; apply QoS to prioritize real-time traffic", "Packet loss; replace the cable", "Throughput; enable jumbo frames"],
  a: 1,
  why: "Delay that <b>varies a lot</b> is <b>jitter</b>, and it breaks real-time audio and video. <b>QoS</b> (priority queuing for voice and video) smooths it out. Jitter buffers help too.",
  no: ["Latency is <b>consistent</b> delay. Here it swings. More bandwidth won't fix jitter when utilization is already low.", "", "The question doesn't mention lost packets.", "Jumbo frames <b>hurt</b> real-time traffic by making small packets wait behind large ones."],
  clue: "<b>Jitter = jumpy delay.</b> Fix with QoS.",
  trig: "'Delay varies', 'choppy voice/video', 'low utilization' → <b>jitter → QoS</b>."
},
{
  id: "t5-14", o: "5.4",
  q: "A link is rated at 1 Gbps, but large file transfers consistently measure about 600 Mbps. What is the 600 Mbps figure called?",
  c: ["Bandwidth", "Throughput", "Latency", "Jitter"],
  a: 1,
  why: "<b>Throughput</b> is the <b>actual</b> data rate you achieve. <b>Bandwidth</b> is the link's maximum capacity (1 Gbps).",
  no: ["Bandwidth is the theoretical maximum, here the 1 Gbps.", "", "Latency is delay, measured in milliseconds, not Mbps.", "Jitter is variation in delay."],
  clue: "<b>Bandwidth = the pipe's size. Throughput = how much water actually flows.</b>",
  trig: "'Rated/maximum' → <b>bandwidth</b>. 'Measured/actual' → <b>throughput</b>."
},
{
  id: "t5-15", o: "5.4",
  q: "A continuous ping to a branch router shows about 1 in every 10 requests timing out, while the replies that do arrive are fast. Which metric describes this problem?",
  c: ["Latency", "Jitter", "Packet loss", "Bandwidth"],
  a: 2,
  why: "Requests with <b>no reply</b> = <b>packet loss</b> (about 10%). Look for bad cabling, interface errors, congestion drops or a weak wireless signal.",
  no: ["Latency is delay, and the replies that arrive are fast.", "Jitter is varying delay, not missing replies.", "", "Bandwidth is capacity."],
  clue: "<b>Loss = the letter never arrives.</b> Latency = it arrives late.",
  trig: "'Request timed out', 'x% loss', 'drops' → <b>packet loss</b>."
},
{
  id: "t5-16", o: "5.4",
  q: "Wi-Fi clients in one area keep getting kicked off the network. A wireless analyzer shows a flood of deauthentication frames addressed to them. What is MOST likely happening?",
  c: ["Channel overlap", "A deauthentication attack causing client disassociation", "DHCP exhaustion", "Band steering"],
  a: 1,
  why: "Floods of spoofed <b>deauth frames</b> force clients to <b>disassociate</b>. It's a wireless DoS, often used to push victims toward an evil twin. 802.11w (management frame protection, part of WPA3) prevents it.",
  no: ["Channel overlap causes slowness and retries, not deauth floods.", "", "DHCP exhaustion leaves clients with 169.254 addresses. They don't get disconnected.", "Band steering nudges clients between bands. It doesn't flood them with deauths."],
  clue: "<b>Deauth flood = someone yanking everyone's Wi-Fi plug.</b> Fix: WPA3 / 802.11w (protected management frames).",
  trig: "'Deauthentication frames', 'clients keep disconnecting' → <b>deauth attack / disassociation</b>."
},
{
  id: "t5-17", o: "5.4",
  q: "An AP was installed inside a closed metal network cabinet in a storage room. Users in the next room report a weak signal. What is the issue?",
  c: ["Signal degradation from the metal enclosure (absorption/reflection)", "Wrong SSID", "DHCP misconfiguration", "Duplex mismatch"],
  a: 0,
  why: "Metal blocks and <b>reflects RF</b>, so the signal is badly <b>degraded</b> before it leaves the cabinet. Mount the AP in the open, ideally on the ceiling, near the users.",
  no: ["", "The SSID name doesn't affect signal strength.", "DHCP issues affect addressing, not signal strength.", "Duplex applies to wired links."],
  clue: "<b>Metal = a mirror for Wi-Fi.</b> Concrete and water absorb it.",
  trig: "'Weak signal', 'AP in cabinet/behind metal', 'walls/elevator shaft' → <b>signal degradation/placement</b>."
},
{
  id: "t5-18", o: "5.5",
  q: "A technician needs to see which process is listening on TCP 3389 on a Windows server, including the process ID. Which command is BEST?",
  c: ["ipconfig /all", "netstat -ano", "tracert", "nslookup"],
  a: 1,
  why: "<b>netstat -ano</b> lists <b>a</b>ll connections and listening ports, <b>n</b>umerically, with the <b>o</b>wning process ID (PID).",
  no: ["ipconfig shows the IP configuration, not listening ports.", "", "tracert maps the hop path.", "nslookup queries DNS."],
  clue: "<b>netstat = network statistics.</b> -a all, -n numbers, -o owner PID.",
  trig: "'Listening ports', 'active connections', 'which process' → <b>netstat</b>."
},
{
  id: "t5-19", o: "5.5",
  q: "A user says their switch port is in the wrong VLAN. Which command quickly shows every VLAN on the switch and which access ports belong to each?",
  c: ["show interface", "show vlan (brief)", "show ip route", "show arp"],
  a: 1,
  why: "<b>show vlan brief</b> lists each VLAN with its name, status and <b>assigned ports</b>.",
  no: ["show interface shows a port's errors, speed and duplex, not a VLAN-to-port list.", "", "show ip route shows the routing table.", "show arp shows IP-to-MAC mappings."],
  clue: "<b>'Which VLAN is this port in?' → show vlan.</b>",
  trig: "'VLAN membership', 'port in wrong VLAN' → <b>show vlan</b>."
},
{
  id: "t5-20", o: "5.5",
  q: "A router can't reach 10.9.0.0/16. Which command verifies whether the router has a path to that network and which next hop it will use?",
  c: ["show vlan", "show ip route", "show mac address-table", "show power inline"],
  a: 1,
  why: "<b>show ip route</b> displays the routing table: each known network, how it was learned, and its next hop and interface.",
  no: ["show vlan is Layer 2 VLAN info.", "", "The MAC table is Layer 2 forwarding.", "show power inline is PoE."],
  clue: "<b>Route problem → routing table → show ip route.</b>",
  trig: "'Does the router know the path?', 'next hop' → <b>show ip route</b>."
},
{
  id: "t5-21", o: "5.5",
  q: "A technician just terminated a new Ethernet run and wants to verify continuity and that each wire lands on the correct pin at both ends. Which tool should be used?",
  c: ["Toner and probe", "Cable tester", "Wi-Fi analyzer", "Visual fault locator"],
  a: 1,
  why: "A <b>cable tester</b> checks the <b>wire map</b>: continuity, opens, shorts, miswires and split pairs.",
  no: ["A toner and probe <b>locates</b> a cable among many. It doesn't verify the pinout.", "", "A Wi-Fi analyzer measures wireless signals.", "A VFL shines red light to find breaks in <b>fiber</b>."],
  clue: "<b>Tester = is it wired right? Toner = which cable is it?</b>",
  trig: "'Wire map', 'continuity', 'verify termination' → <b>cable tester</b>. 'Find/trace a cable' → <b>toner</b>."
},
{
  id: "t5-22", o: "5.5",
  q: "In an all-Cisco network, an engineer wants to see the model, IP address and port of each directly connected Cisco neighbor. Which proprietary discovery protocol provides this?",
  c: ["LLDP", "CDP", "SNMP", "ARP"],
  a: 1,
  why: "<b>CDP (Cisco Discovery Protocol)</b> advertises device info to directly connected Cisco neighbors. View it with <code>show cdp neighbors detail</code>.",
  no: ["LLDP does the same job but is the <b>vendor-neutral</b> standard. The question says proprietary.", "", "SNMP is management polling, not neighbor discovery.", "ARP maps IP to MAC only."],
  clue: "<b>CDP = Cisco only. LLDP = Link Layer, any vendor.</b>",
  trig: "'Directly connected neighbors' + 'Cisco/proprietary' → <b>CDP</b>. 'Multivendor' → <b>LLDP</b>."
},
{
  id: "t5-23", o: "5.5",
  q: "The DHCP server outage is fixed, but a Windows PC still shows a 169.254.x.x address. What is the quickest way to get a valid lease?",
  c: ["ping 127.0.0.1", "ipconfig /release then ipconfig /renew", "netstat -r", "nslookup"],
  a: 1,
  why: "<b>ipconfig /release</b> drops the current address and <b>/renew</b> sends a fresh DHCP request (DORA), getting a valid address now that the server is back.",
  no: ["Loopback ping only tests the local stack.", "", "netstat -r shows routes.", "nslookup queries DNS."],
  clue: "<b>Release and renew = 'forget it, ask again'.</b>",
  trig: "'Get a new DHCP address', 'APIPA after fix' → <b>ipconfig /release + /renew</b>."
},
{
  id: "t5-24", o: "5.5",
  q: "A remote site has intermittent slowness. The engineer wants a tool that pings every hop along the path over time and reports latency and loss per hop. Which Windows tool fits BEST?",
  c: ["pathping", "arp", "ipconfig", "nbtstat"],
  a: 0,
  why: "<b>pathping</b> combines traceroute and ping. It finds every hop, then sends many pings to each one and reports <b>loss and latency per hop</b>. (mtr is the Linux equivalent.)",
  no: ["", "arp shows the IP-to-MAC cache.", "ipconfig shows local settings.", "nbtstat is for NetBIOS name info."],
  clue: "<b>pathping = traceroute + ping, with statistics.</b>",
  trig: "'Per-hop loss/latency over time' → <b>pathping</b> (Windows) / <b>mtr</b> (Linux)."
},
{
  id: "t5-25", o: "5.5",
  q: "A network admin wants to find every live host on 10.20.0.0/24 and the services each one exposes, to check for unauthorized devices. Which tool is BEST?",
  c: ["Wireshark", "Nmap (IP/port scanner)", "Toner probe", "show interface"],
  a: 1,
  why: "<b>Nmap</b> scans a range to discover <b>live hosts</b> and <b>open ports/services</b>. It's ideal for finding unknown devices.",
  no: ["Wireshark captures traffic passively. It only sees hosts that happen to send packets past it.", "", "A toner traces physical cables.", "show interface shows one switch port's status."],
  clue: "<b>Nmap = network map</b>: who's alive and which doors are open.",
  trig: "'Discover hosts', 'open ports', 'scan subnet' → <b>Nmap</b>."
}
);
