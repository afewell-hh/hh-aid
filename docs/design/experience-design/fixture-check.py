"""Independent arithmetic check for the D02 walkthrough fixtures.

Standard library only. Run: python3 -I fixture-check.py
Checks logical counts under the stated hypothetical assumptions (R04 H400 and
a 64-port 800G spine). It does not check hardware, upstream validation or
physical compatibility.
"""
from fractions import Fraction as F


def ceil_div(a, b):
    return -(-a // b)


# F1: 128 HGX-class nodes, 8 rails x 400G, one plane (R04 S03 assumptions).
N, RAILS, GROUP = 128, 8, 64          # GROUP = endpoint slots per H400 leaf
groups = ceil_div(N, GROUP)
leaves = groups * RAILS               # one leaf per rail per first-hop group
edges = N * RAILS
ep_cages = edges // 2                 # 2x400G endpoint cages, full groups
uplinks = leaves * 32                 # 32 uplink cages at 1x800G per leaf
spines = min(s for s in range(1, 33) if 64 * s >= uplinks and 32 % s == 0)
per_pair = 32 // spines
D, U = 64 * 400, 32 * 800             # Gb/s per direction, per leaf
assert (groups, leaves, edges, ep_cages, uplinks, spines, per_pair) == \
    (2, 16, 1024, 512, 512, 8, 4)
assert F(D, U) == 1
assert F(D * spines, U * (spines - 1)) == F(8, 7)        # one spine lost
assert leaves + spines == 24                              # switch mgmt ports

# Endpoint construction alternatives (R05 section 4 C and optical variant).
assert ep_cages == 512                                    # split assemblies
assert (ep_cages, 2 * ep_cages, 2 * ep_cages) == (512, 1024, 1024)

# Impossible request: full remote bandwidth after any one spine loss, with
# the fixed 32/32 cage split. U_after = U*(S-1)/S < D for every S.
assert all(F(D * s, U * (s - 1)) > 1 for s in range(2, 65))
# Relaxation preview: 16 spines, 2 links per leaf-spine pair.
assert 16 * 64 >= 512 and 32 // 16 == 2
assert F(D, (32 - 2) * 800) == F(16, 15)

# Change: 136 nodes, full-rail-per-group policy (R04 P02), 8 spines locked.
N2 = 136
groups2 = ceil_div(N2, GROUP)
leaves2 = groups2 * RAILS
new_nodes = N2 - 2 * GROUP
new_cages = RAILS * ceil_div(new_nodes, 2)
assert (groups2, leaves2, N2 * RAILS, new_nodes, new_cages) == \
    (3, 24, 1088, 8, 32)
assert 8 * 64 - 16 * 32 == 0                    # no free locked spine ports
need = RAILS * ceil_div(new_nodes * 400, 800)   # D/U <= 1 on new leaves
assert need == 32
assert F(D, 30 * 800) == F(16, 15)              # existing leaves giving up 2

# F2: eight NVL72 racks under R04 S06-1 assumptions.
assert (8 * 18, 8 * 18 * 4, 8 * 4, 8 * 18 * 4 * 400) == \
    (144, 576, 32, 230_400)

# R04 N01: 33 nodes, two rails per leaf, four H400 leaves.
assert 33 * 2 > 64 and 33 * 8 > 4 * 64

print("D02 fixture arithmetic passed")
