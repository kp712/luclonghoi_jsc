"""Turn an NDVI time series into farmer-readable facts.
NDVI = satellite "greenness" (0 = bare soil/water, ~0.8 = dense green crop).
Input everywhere: dict {"YYYY-MM-DD": ndvi}.
"""
from datetime import date

BARE = 0.3   # shortcut: one fixed threshold for "bare/flooded field"; tune by looking at real series
PEAK = 0.5   # a crop peak must be at least this green
MIN_GAP_DAYS = 60  # two rice peaks can't be closer than ~2 months


def _sorted(series):
    pts = sorted((date.fromisoformat(d), v) for d, v in series.items())
    vals = [v for _, v in pts]
    # 3-point median removes single cloudy dips/spikes
    smooth = [sorted(vals[max(i - 1, 0):i + 2])[len(vals[max(i - 1, 0):i + 2]) // 2] for i in range(len(vals))]
    return [d for d, _ in pts], smooth


def monthly_mean(series, keep=None):
    """Average NDVI for each calendar month (index 0 = Jan); None if no data. keep(date) limits the dates used."""
    days, vals = _sorted(series)  # smooth the whole series first, then pick dates
    out = []
    for m in range(1, 13):
        xs = [v for d, v in zip(days, vals) if d.month == m and (not keep or keep(d))]
        out.append(round(sum(xs) / len(xs), 3) if xs else None)
    return out


def monthly_range(series, keep=None):
    """Lowest and highest yearly average NDVI for each calendar month (index 0 = Jan); None if no data. keep(date) limits the dates used."""
    days, vals = _sorted(series)
    by_year = {}
    for d, v in zip(days, vals):
        if keep and not keep(d):
            continue
        by_year.setdefault((d.year, d.month), []).append(v)
    lo, hi = [], []
    for m in range(1, 13):
        ms = [sum(xs) / len(xs) for (_, mm), xs in by_year.items() if mm == m]
        lo.append(round(min(ms), 3) if ms else None)
        hi.append(round(max(ms), 3) if ms else None)
    return lo, hi


def bare_months(series, share=0.5):
    """Months (1-12) when the field is bare or flooded (no green crop) in more than `share` of the years ("usually").
    Each year is checked on its own, so a crop that shifts by a month between years doesn't hide its bare gap."""
    days, vals = _sorted(series)
    by_year = {}
    for d, v in zip(days, vals):
        by_year.setdefault((d.year, d.month), []).append(v)
    out = []
    for m in range(1, 13):
        ms = [sum(xs) / len(xs) for (_, mm), xs in by_year.items() if mm == m]
        if ms and sum(v < BARE for v in ms) > share * len(ms):
            out.append(m)
    return out


def crops_per_year(series):
    """Count green peaks per year = how many crops the satellite sees."""
    days, vals = _sorted(series)
    peaks = []
    for i in range(1, len(vals) - 1):
        if vals[i] >= PEAK and vals[i] >= vals[i - 1] and vals[i] > vals[i + 1]:
            if peaks and (days[i] - peaks[-1][0]).days < MIN_GAP_DAYS:
                if vals[i] > peaks[-1][1]:
                    peaks[-1] = (days[i], vals[i])
                continue
            peaks.append((days[i], vals[i]))
    years = (days[-1] - days[0]).days / 365.25 if len(days) > 1 else 0
    return round(len(peaks) / years, 1) if years > 0 else 0.0
