<!-- GW Charter: University of Dhaka PMICS Independent Research Provenance -->
# Chapter 4: Predictive Memory Security Assessment (PMSA) Methodology

**Project:** Predictive Memory Security for AI Systems  
**Platform:** ShorbornoAI (Multimodal Bengali / Banglish / English Knowledge System)  
**Researchers:** Md. Aminul Islam (Roll: 70002), Alvee Talukder (Roll: 70062)  
**Supervisor:** Prof. Dr. Md. Rezaul Karim, Coordinator, PMICS, Department of Computer Science and Engineering, University of Dhaka, Bangladesh  

---

## 4.1 Multimodal System Architecture Overview

The **ShorbornoAI** platform processes bilingual and code-mixed queries (**bn**, **en**, **bn-EN**) through **Shorborno BRAIN** (`Identity -> Capability -> Policy`) and a **6-Channel Modality Router** (`Text`, `Voice`, `Audio`, `Image`, `Video`, `Docs`). Persistent memory spans **Qdrant** (Vector), **Neo4j** (Graph), and **TruthDB** (Bilingual OCR).

The **Predictive Memory Security Assessment (PMSA)** framework operates as a continuous **7-stage closed-loop architecture**:
1. **Multimodal User Interaction:** Queries arrive in Bengali, Banglish, or English across 6 channels.
2. **ShorbornoAI Platform:** Shorborno BRAIN validates identity, capability, and policy before routing context.
3. **AI Memory Layer:** Qdrant, Neo4j, and TruthDB capture vector embeddings, graph edges, and provenance events.
4. **Continuous Monitoring & Telemetry:** HMAC hashing verifies integrity, drift monitors compare against baselines, and NATS JetStream streams telemetry.
5. **Predictive Risk Assessment (PMSA):** The Rust Digital Twin reconciles state every 60s and computes breach probability $P(B_t)$ across 5 threat categories (*Poisoning, Sleeper, Drift, Retrieval, Behavioral*).
6. **Early Warning System:** The dashboard visualizes the Evidence-to-Risk (E2R) graph and dispatches Email/Viber alerts when $P(B_t) \ge 0.75$.
7. **Response & Recovery:** The 4-Stage Interception Pipeline isolates compromised memory for human-in-the-loop validation and rollback.

---

## 4.2 Bounded Mathematical Risk Model

For a memory projection evaluated at dwell time $t \ge 0$ within horizon $T_{\max} > 0$, breach probability $P(B_t) \in [0, 1]$ is:

$$P(B_t) = \min\left(1.0,\; \left(\frac{N_{\text{quarantined}}}{N_{\text{total}}}\right) \times \left(\frac{\Delta_{\text{semantic}}}{2}\right) \times \frac{\log(1 + t)}{\log(1 + T_{\max})}\right)$$

| Breach Probability $P(B_t)$ | Severity | Automated System Action |
| :--- | :--- | :--- |
| $0.00 \le P(B_t) < 0.25$ | **Low** | Normal operation; continuous NATS telemetry logging |
| $0.25 \le P(B_t) < 0.50$ | **Medium** | Elevated Digital Twin sampling; highlighted in `DriftVisualizer.tsx` |
| $0.50 \le P(B_t) < 0.75$ | **High** | Soft quarantine of affected E2R subgraph; operator warning |
| $P(B_t) \ge 0.75$ | **Critical** | Immediate 4-stage interception, Email/Viber alert, human rollback |

## 4.3 Evaluation Status
- **Mathematical Model & Architecture Specification:** `COMPLETE`
- **Experimental Dataset Execution (Bengali / Banglish / English):** `NOT_RUN`
