import time
import numpy as np

try:
    import faiss
except ImportError as exc:
    raise SystemExit("faiss-cpu not installed. Run: pip install faiss-cpu numpy") from exc


def recall_at_k(gt_idx: np.ndarray, pred_idx: np.ndarray, k: int) -> float:
    total = 0.0
    for g, p in zip(gt_idx[:, :k], pred_idx[:, :k]):
        total += len(set(g.tolist()) & set(p.tolist())) / float(k)
    return total / float(len(gt_idx))


def bench_query(index, xq: np.ndarray, k: int, runs: int = 25):
    index.search(xq[: min(4, len(xq))], k)
    latencies_ms = []
    pred = None
    for _ in range(runs):
        t0 = time.perf_counter()
        _, pred = index.search(xq, k)
        latencies_ms.append((time.perf_counter() - t0) * 1000.0)
    arr = np.array(latencies_ms)
    return pred, float(np.median(arr)), float(np.percentile(arr, 95))


def main(n_vec: int = 10000, n_query: int = 50, dim: int = 384, k: int = 5):
    rng = np.random.default_rng(42)
    xb = rng.standard_normal((n_vec, dim), dtype=np.float32)
    xq = rng.standard_normal((n_query, dim), dtype=np.float32)
    faiss.normalize_L2(xb)
    faiss.normalize_L2(xq)

    # 1. Exact baseline (Inner Product on L2-normalized vectors == cosine similarity)
    exact = faiss.IndexFlatIP(dim)
    t0 = time.perf_counter()
    exact.add(xb)
    exact_build_ms = (time.perf_counter() - t0) * 1000.0
    gt_idx, exact_p50, exact_p95 = bench_query(exact, xq, k)

    rows = [
        ("FlatIP (Exact Baseline)", exact_build_ms, exact_p50, exact_p95, 1.0),
    ]

    # 2. HNSW graph index
    hnsw = faiss.IndexHNSWFlat(dim, 32, faiss.METRIC_INNER_PRODUCT)
    hnsw.hnsw.efConstruction = 80
    hnsw.hnsw.efSearch = 64
    t0 = time.perf_counter()
    hnsw.add(xb)
    hnsw_build_ms = (time.perf_counter() - t0) * 1000.0
    hnsw_idx, hnsw_p50, hnsw_p95 = bench_query(hnsw, xq, k)
    rows.append((
        "HNSWFlat (M=32, efS=64)",
        hnsw_build_ms,
        hnsw_p50,
        hnsw_p95,
        recall_at_k(gt_idx, hnsw_idx, k),
    ))

    # 3. IVF inverted-file index
    nlist = max(16, min(256, int(np.sqrt(n_vec))))
    quantizer = faiss.IndexFlatIP(dim)
    ivf = faiss.IndexIVFFlat(quantizer, dim, nlist, faiss.METRIC_INNER_PRODUCT)
    t0 = time.perf_counter()
    ivf.train(xb)
    ivf.add(xb)
    ivf.nprobe = max(4, nlist // 8)
    ivf_build_ms = (time.perf_counter() - t0) * 1000.0
    ivf_idx, ivf_p50, ivf_p95 = bench_query(ivf, xq, k)
    rows.append((
        f"IVFFlat (nlist={nlist}, nprobe={ivf.nprobe})",
        ivf_build_ms,
        ivf_p50,
        ivf_p95,
        recall_at_k(gt_idx, ivf_idx, k),
    ))

    print(f"{'Index / Baseline':<36} | {'Build ms':>8} | {'p50 ms':>7} | {'p95 ms':>7} | {'Recall@' + str(k):>8}")
    print("-" * 80)
    for label, b_ms, p50, p95, rec in rows:
        print(f"{label:<36} | {b_ms:8.2f} | {p50:7.3f} | {p95:7.3f} | {rec:8.3f}")


if __name__ == "__main__":
    main()
