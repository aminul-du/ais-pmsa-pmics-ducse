<!-- GW Charter: University of Dhaka PMICS Independent Research Provenance -->
# Chapter 4: Predictive Memory Security Assessment (PMSA) Methodology

**Platform:** ShorbornoAI (Multimodal Bengali / Banglish / English)
**Researchers:** Md. Aminul Islam (Roll: 70002), Alvee Talukder (Roll: 70062)
**Supervisor:** Prof. Dr. Md. Rezaul Karim, Coordinator, PMICS, Dept. of CSE, University of Dhaka, Bangladesh

## Bounded Breach Probability Model
$$P(B_t) = \min\left(1.0,\; \frac{N_{\text{quarantined}}}{N_{\text{total}}} \times \frac{\Delta_{\text{semantic}}}{2} \times \frac{\log(1 + t)}{\log(1 + T_{\max})}\right)$$

- **Critical Threshold:** $P(B_t) \ge 0.75$ triggers 4-stage interception and human-validated rollback.
- **Benchmark Status:** `NOT_RUN`
