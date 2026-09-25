# Clock-winding ratchet: two clicks per degree, timed from the same easing the composition uses (inOut cubic).
import wave, array, subprocess, json
SR = 48000

def load(path, peak_db=-6.0):
    subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-y","-i",path,"-ac","1","-ar",str(SR),"-f","s16le","/tmp/_click.raw"], check=True)
    a = array.array("h"); a.frombytes(open("/tmp/_click.raw","rb").read())
    peak = max(abs(x) for x in a) or 1
    g = (10 ** (peak_db / 20) * 32767) / peak
    return array.array("h", [int(x * g) for x in a])

clicks = [load(f"assets/sfx-el/ratchet{n}-trim.wav") for n in (1, 2, 3)]

def in_out(x): return 4*x*x*x if x < 0.5 else 1 - ((-2*x+2)**3)/2

def crossings(total, t0, t1, per_degree=1):
    # times where the remaining angle crosses each 1/per_degree step
    edges = [k / per_degree for k in range(int(total * per_degree) - 1, -1, -1)]
    times, n, prev = [], 40000, total
    for i in range(1, n + 1):
        p = i / n; off = total * (1 - in_out(p))
        for e in edges:
            if prev > e + 0.25 / per_degree >= off: times.append(t0 + p * (t1 - t0))
        prev = off
    return sorted(times)

def build(name, times, t0, length):
    buf = array.array("i", [0]) * int(length * SR)
    for i, t in enumerate(times):
        c = clicks[(i * 7) % 3]
        gain = 0.5 + 0.12 * ((i * 5) % 4) / 3
        start = int((t - t0) * SR)
        for j, s in enumerate(c):
            if start + j < len(buf): buf[start + j] += int(s * gain)
    out = array.array("h", [max(-32768, min(32767, x)) for x in buf])
    w = wave.open(f"assets/audio/{name}.wav", "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(out.tobytes()); w.close()

DIAL = (35, 19.5, 23.0); FACE = (38, 29.1, 33.4)
d = crossings(*DIAL); f = crossings(*FACE)
build("ticks-dial", d, 19.5, 3.7)
build("ticks-face", f, 29.1, 4.5)
gaps = lambda ts: round(1 / min(b - a for a, b in zip(ts, ts[1:])), 1)
print(json.dumps({"dial_clicks": len(d), "face_clicks": len(f), "peak_clicks_per_sec": [gaps(d), gaps(f)]}))
