#!/usr/bin/env python3
"""Arithmetic behind the illustrative quantities in server-profile-experience.md.

Standard library only. This is not a planner, solver or catalog: it multiplies
hand-entered, synthetic per-unit fixture quantities and checks the counting
rules the screens display. Every part below is a generic placeholder or an
unverified sponsor shorthand, never a vendor-qualified SKU. Switch (leaf/spine)
counts are deliberately absent: the screens show them as "not estimated".

Run: python3 -I bom-arithmetic.py
"""

# Ports: (id, hardware item, attachment, medium, rail)
# medium: "optic"   = one pluggable module in the server cage, one at the far end
#         "dac"     = integrated assembly, one per link, owned by the connection
#         "unknown" = medium not chosen; link counted, media not counted
#         "rj45"    = integrated PHY; copper cord is external cabling (excluded)

def hgx_profile(dpu_variant="dual", storage=True):
    """Illustrative HGX 8-GPU (B200-class) server class. Synthetic."""
    hw = [("BE-NIC", 8, "backend NIC, 1 port, 400G-class (generic)")]
    ports = [(f"be{r}", "BE-NIC", "backend", "optic", r) for r in range(1, 9)]
    if dpu_variant == "dual":
        hw.append(("FE-DPU2", 1, "DPU, 2 ports (sponsor 'BF3' shorthand; unverified)"))
        ports += [("fe1", "FE-DPU2", "frontend", "dac", None),
                  ("fe2", "FE-DPU2", "frontend", "dac", None)]
    else:
        hw.append(("FE-DPU1", 2, "DPU, 1 port each (sponsor 'BF3' shorthand; unverified)"))
        ports += [("fe1", "FE-DPU1", "frontend", "dac", None),
                  ("fe2", "FE-DPU1", "frontend", "dac", None)]
    if storage:
        hw.append(("ST-NIC", 1, "storage NIC, 2 ports, 200G-class (generic)"))
        ports += [("st1", "ST-NIC", "storage", "unknown", None),
                  ("st2", "ST-NIC", "storage", "unknown", None)]
    ports += [("ib1", "ONBOARD", "in-band mgmt", "rj45", None),
              ("bmc", "ONBOARD", "bmc/oob", "rj45", None)]
    extra = [("power cord", 4, "unknown"),          # included vs purchased unknown
             ("rail kit", 1, "included"),
             ("support contract (per server)", 1, "purchased")]
    return hw, ports, extra


def storage_profile():
    """Illustrative generic 2U storage server class. Synthetic."""
    hw = [("SS-NIC", 1, "storage NIC, 2 ports, 200G-class (generic)")]
    ports = [("st1", "SS-NIC", "storage", "unknown", None),
             ("st2", "SS-NIC", "storage", "unknown", None),
             ("ib1", "ONBOARD", "in-band mgmt", "rj45", None),
             ("bmc", "ONBOARD", "bmc/oob", "rj45", None)]
    extra = [("power cord", 2, "unknown"), ("drive (generic)", 24, "included")]
    return hw, ports, extra


def expand(profile, n):
    hw, ports, extra = profile
    out = {"servers": n}
    for item, q, _ in hw:
        out[item] = out.get(item, 0) + q * n
    fabric = [p for p in ports if p[2] in ("backend", "frontend", "storage")]
    out["fabric links"] = len(fabric) * n
    for att in ("backend", "frontend", "storage"):
        out[f"links:{att}"] = sum(1 for p in fabric if p[2] == att) * n
    out["server-end optics"] = sum(1 for p in fabric if p[3] == "optic") * n
    out["far-end optics"] = out["server-end optics"]   # one per optical link end
    out["integrated assemblies"] = sum(1 for p in fabric if p[3] == "dac") * n
    out["links, media unknown"] = sum(1 for p in fabric if p[3] == "unknown") * n
    out["rj45 links (cords excluded)"] = sum(1 for p in ports if p[3] == "rj45") * n
    for name, q, _ in extra:
        out[name] = out.get(name, 0) + q * n
    return out


def rails(profile):
    return sorted(p[4] for p in profile[1] if p[4] is not None)


# --- 1 unit and 100 units, default variant (dual-port DPU + storage) -------
h1 = expand(hgx_profile(), 1)
assert h1["BE-NIC"] == 8 and h1["FE-DPU2"] == 1 and h1["ST-NIC"] == 1
assert h1["fabric links"] == 12               # 8 backend + 2 frontend + 2 storage
assert h1["server-end optics"] == 8 and h1["integrated assemblies"] == 2
assert h1["links, media unknown"] == 2 and h1["rj45 links (cords excluded)"] == 2
assert rails(hgx_profile()) == list(range(1, 9))

h100 = expand(hgx_profile(), 100)
assert h100["servers"] == 100                 # one population, not one per fabric
assert h100["BE-NIC"] == 800 and h100["FE-DPU2"] == 100 and h100["ST-NIC"] == 100
assert h100["links:backend"] == 800 and h100["links:frontend"] == 200
assert h100["links:storage"] == 200 and h100["fabric links"] == 1200
assert h100["server-end optics"] + h100["far-end optics"] == 1600  # 2 per optical link
assert h100["integrated assemblies"] == 200   # counted once per link, not per end
assert h100["power cord"] == 400 and h100["rail kit"] == 100
assert h100["support contract (per server)"] == 100
assert h100["links, media unknown"] == 200    # quantity shown, media not claimed

# --- Variant: two single-port DPUs instead of one dual-port DPU -------------
v2 = expand(hgx_profile(dpu_variant="single"), 100)
assert v2["FE-DPU1"] == 200 and "FE-DPU2" not in v2
assert v2["links:frontend"] == 200 and v2["integrated assemblies"] == 200
assert {k: v for k, v in v2.items() if not k.startswith("FE-")} == \
       {k: v for k, v in h100.items() if not k.startswith("FE-")}

# --- Variant: no separate storage NIC ---------------------------------------
ns = expand(hgx_profile(storage=False), 100)
assert ns["fabric links"] == 1000 and "ST-NIC" not in ns and ns["links:storage"] == 0

# --- Second class reuses the existing storage fabric ------------------------
s12 = expand(storage_profile(), 12)
assert s12["links:storage"] == 24 and s12["drive (generic)"] == 288
assert h100["links:storage"] + s12["links:storage"] == 224
assert h100["servers"] + s12["servers"] == 112  # two populations, no duplication

# --- Attachment count does not change server count --------------------------
assert expand(hgx_profile(storage=False), 100)["servers"] == h100["servers"] == 100

print("server-profile BOM arithmetic passed")
