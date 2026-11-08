"""Independent arithmetic check for the D02 walkthrough fixtures.

Standard library only. Run: python3 -I fixture-check.py
Checks logical counts under the stated hypothetical assumptions (R04 H400 and
a 64-port 800G spine, plus the hypothetical 48 x 25G leaf and 32 x 100G spine
of the redundant-endpoint fixture). It does not check hardware, upstream validation or
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


# --- Revision 2: same workspace, three structurally different fixtures. ---
def spines(leaves, u, ports, min_s=1, d=None, U=None, loss=None):
    """Smallest S dividing u with ports*S >= leaves*u (uniform policy)."""
    for s in range(max(1, min_s), u + 1):
        if u % s or ports * s < leaves * u:
            continue
        if loss is not None and (s < 2 or F(d * s, U * (s - 1)) > loss):
            continue
        return s
    return None


# F1 locked-spine variant (136 nodes, 8 spines ordered): per-leaf minimum
# uplinks for D/U <= 1 are 32 on the 16 full leaves and 4 on the 8 new ones.
assert 16 * 32 + 8 * ceil_div(8 * 400, 800) == 544 > 8 * 64
assert new_cages == 32 and 512 + 32 == 544                # prototype cage line

# Custom profile: 64 endpoints x 4 links x 800G on H400 native 800G cages.
slots800 = 32
assert (64 * 4, ceil_div(64, slots800) * 4, 4 * (32 + 32)) == (256, 8, 256)

# F2: eight NVL72-style racks, R04 S06-1/S06-2 assumptions, 10 uplinks/leaf.
R, TR, RL = 8, 18, 4
leaves_r = R * RL
cpl = ceil_div(TR, 2)
assert (R * TR * RL, leaves_r, leaves_r * cpl, leaves_r * (32 - cpl)) == \
    (576, 32, 288, 736)
d_r, u_r = TR * 400, 10 * 800
assert F(d_r, u_r) == F(9, 10)
s_r = spines(leaves_r, 10, 64)
assert (s_r, 10 // s_r, leaves_r * 10, leaves_r + s_r) == (5, 2, 320, 37)
assert spines(leaves_r, 10, 64, d=d_r, U=u_r, loss=1) == 10   # feasible
assert spines(2 * RL, 10, 64) == 2                              # R04 S06-2
assert (288, 2 * 288, 2 * 288) == (cpl * leaves_r, 576, 576)    # optical alt

# F3: 40 dual-homed endpoints (ESLAG pair), hypothetical 48 x 25G + 8 x 100G
# leaves; topology unknown, so mesh and leaf-spine are separate totals.
def f3(n):
    pairs = ceil_div(n, 48)
    lv = 2 * pairs
    d = min(n, 48) * 25
    mesh_per = 8 // (lv - 1)
    mesh_links = lv * (lv - 1) // 2 * mesh_per
    s = spines(lv, 8, 32, min_s=2)
    return lv, n * 2, mesh_links, F(d, (lv - 1) * mesh_per * 100), s, \
        lv * 8, F(d, 800)
assert f3(40) == (2, 80, 8, F(5, 4), 2, 16, F(5, 4))
assert 2 * 48 - 80 == 16                                        # unused ports
assert (2 + 0, 2 + 2) == (2, 4)                                 # OOB mesh | ls
assert f3(60)[:5] == (4, 120, 12, F(2, 1), 2)

print("D02 fixture arithmetic passed")
