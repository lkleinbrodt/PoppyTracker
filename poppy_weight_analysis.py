#!/usr/bin/env python3
"""
Poppy's Weight Growth Analysis - Final Report Generator

This script analyzes Poppy's weight data and generates a final report with
growth projections and confidence intervals.
"""

import numpy as np
import matplotlib.pyplot as plt
from scipy.optimize import curve_fit
from datetime import datetime
import pandas as pd

# Configuration
CONFIDENCE_LEVEL = 0.95  # Adjust this to change confidence interval width (0.80 = 80%, 0.95 = 95%, etc.)
KG_TO_LBS = 2.20462  # Conversion factor from kg to pounds
# Random seed for reproducible bootstrap results (set to None to randomize each run)
RANDOM_SEED = 12345
# Models to include in the ensemble (choose from: "Logistic", "Gompertz", "Richards")
INCLUDE_MODELS = ("Logistic", "Gompertz")
# Upper prior bound for adult weight (lbs). Half Great Dane unlikely > 120 lbs.
MAX_ASYMPTOTE_LBS = 120.0

# Poppy's data
BIRTH_DATE = "2024-10-21"
WEIGHTS_KG = {
    "02-18-2025": 11.6,
    "03-06-2025": 13.8,
    "03-12-2025": 15.4,
    "04-30-2025": 22.2,
    "09-12-2025": 35.5,
}

# Great Dane reference data (for comparison)
GREAT_DANE_DATA = {
    "age_months": [0, 0.25, 0.5, 0.75, 1, 2, 3, 4, 5, 6, 7, 8, 9, 12],
    "age_days": [0, 7, 14, 21, 30, 60, 90, 120, 150, 180, 210, 240, 270, 365],
    "weight_min_kg": [
        0.45,
        0.90,
        1.0,
        1.8,
        2.3,
        6.8,
        11.3,
        20.4,
        27.2,
        29.4,
        31.7,
        36.2,
        38.5,
        43.0,
    ],
    "weight_max_kg": [
        0.90,
        1.0,
        2.0,
        3.2,
        3.6,
        13.6,
        20.4,
        29.4,
        38.5,
        45.3,
        49.8,
        54.4,
        56.6,
        63.5,
    ],
    "weight_avg_kg": [
        0.68,
        0.95,
        1.5,
        2.5,
        2.95,
        10.2,
        15.85,
        24.9,
        32.85,
        37.35,
        40.75,
        45.3,
        47.55,
        53.25,
    ],
}


def date_to_days(date_str, birth_date_str):
    """Convert date string to days since birth"""
    birth = datetime.strptime(birth_date_str, "%Y-%m-%d")
    current = datetime.strptime(date_str, "%m-%d-%Y")
    return (current - birth).days


def logistic_growth(t, A, K, r, t0):
    """Logistic growth model: A + (K-A) / (1 + exp(-r*(t-t0)))"""
    return A + (K - A) / (1 + np.exp(-r * (t - t0)))


def gompertz_growth(t, A, K, r, t0):
    """Gompertz growth model: A + (K-A) * exp(-exp(-r*(t-t0)))"""
    # Add numerical stability
    exponent = -r * (t - t0)
    # Clip extreme values to prevent overflow
    exponent = np.clip(exponent, -50, 50)
    return A + (K - A) * np.exp(-np.exp(exponent))


def richards_growth(t, A, K, r, t0, nu):
    """Richards growth model: A + (K-A) / (1 + nu * exp(-r*(t-t0)))^(1/nu)"""
    # Add numerical stability
    exponent = -r * (t - t0)
    # Clip extreme values to prevent overflow
    exponent = np.clip(exponent, -50, 50)
    exp_term = np.exp(exponent)
    # Prevent division by zero
    denominator = 1 + nu * exp_term
    denominator = np.maximum(denominator, 1e-10)
    return A + (K - A) / (denominator ** (1 / nu))


def calculate_metrics(y_true, y_pred):
    """Calculate R², RMSE, and MAE"""
    ss_res = np.sum((y_true - y_pred) ** 2)
    ss_tot = np.sum((y_true - np.mean(y_true)) ** 2)
    r2 = 1 - (ss_res / ss_tot)
    rmse = np.sqrt(np.mean((y_true - y_pred) ** 2))
    mae = np.mean(np.abs(y_true - y_pred))
    return r2, rmse, mae


def bootstrap_confidence_interval(
    model_func, days, weights, n_bootstrap=10000, confidence=None, rng=None
):
    """Calculate confidence intervals using bootstrap resampling"""
    if confidence is None:
        confidence = CONFIDENCE_LEVEL

    # RNG for reproducibility
    rng = rng or np.random.default_rng(RANDOM_SEED)
    bootstrap_predictions = []

    # Get current maximum weight for biological constraint
    current_max_weight = np.max(weights)
    # Use a more reasonable constraint: asymptote should be at least 90% of current max weight
    min_asymptote = current_max_weight * 0.9

    # Define bounds for bootstrap fitting with biological constraint
    bounds = {
        logistic_growth: (
            [0.1, min_asymptote, 0.001, 50],
            [5, min(80, MAX_ASYMPTOTE_LBS / KG_TO_LBS), 0.1, 300],
        ),
        gompertz_growth: (
            [0.1, min_asymptote, 0.001, 50],
            [5, min(80, MAX_ASYMPTOTE_LBS / KG_TO_LBS), 0.1, 300],
        ),
        richards_growth: (
            [0.1, min_asymptote, 0.001, 50, 0.5],
            [5, min(80, MAX_ASYMPTOTE_LBS / KG_TO_LBS), 0.1, 300, 5],
        ),
    }

    initial_guesses = {
        logistic_growth: [1.0, max(45, current_max_weight * 1.1), 0.02, 150],
        gompertz_growth: [1.0, max(45, current_max_weight * 1.1), 0.02, 150],
        richards_growth: [1.0, max(45, current_max_weight * 1.1), 0.02, 150, 1.5],
    }

    # Precompute anchor index (most recent measurement) and fix it in each sample
    anchor_idx = int(np.argmax(days))

    for _ in range(n_bootstrap):
        # Resample with replacement but ensure anchor is included
        indices = rng.integers(0, len(days), size=len(days) - 1)
        indices = np.append(indices, anchor_idx)
        bootstrap_days = days[indices]
        bootstrap_weights = weights[indices]

        try:
            # Fit model to bootstrap sample with better bounds
            popt, _ = curve_fit(
                model_func,
                bootstrap_days,
                bootstrap_weights,
                p0=initial_guesses[model_func],
                bounds=bounds[model_func],
                maxfev=10000,
                method="trf",  # Trust Region Reflective algorithm
            )

            # Check for reasonable parameter values and biological constraints
            asymptote = popt[1]
            current_max_weight = np.max(weights)  # Current maximum observed weight
            min_asymptote = current_max_weight * 0.9  # Allow some flexibility

            if (
                asymptote > 20
                and asymptote < 100  # Reasonable asymptote range
                and asymptote
                >= min_asymptote  # Asymptote must be at least 90% of current max weight
                and popt[2] > 0
                and popt[2] < 0.1  # Reasonable growth rate
                and popt[3] > 0
                and popt[3] < 500
            ):  # Reasonable inflection point
                bootstrap_predictions.append(asymptote)
        except (RuntimeError, ValueError, np.linalg.LinAlgError):
            continue

    if len(bootstrap_predictions) < 50:
        return None, None, None

    # Calculate confidence intervals
    alpha = 1 - confidence
    lower_percentile = (alpha / 2) * 100
    upper_percentile = (1 - alpha / 2) * 100

    lower_bound = np.percentile(bootstrap_predictions, lower_percentile)
    upper_bound = np.percentile(bootstrap_predictions, upper_percentile)
    mean_prediction = np.mean(bootstrap_predictions)

    return mean_prediction, lower_bound, upper_bound


def main():
    """Generate Poppy's weight growth analysis report"""

    # Process the data
    days_since_birth = []
    weights = []

    for date_str, weight in WEIGHTS_KG.items():
        days = date_to_days(date_str, BIRTH_DATE)
        days_since_birth.append(days)
        weights.append(weight)

    # Convert to numpy arrays
    days_array = np.array(days_since_birth)
    weights_array = np.array(weights)

    # Display data
    weights_lbs = [w * KG_TO_LBS for w in weights]
    df = pd.DataFrame(
        {"Days since birth": days_since_birth, "Weight (lbs)": weights_lbs}
    ).set_index("Days since birth")
    print("Poppy's Recorded Weights:")
    print(df)
    print()

    # Growth curve models
    models = {}
    model_functions = {
        "Logistic": logistic_growth,
        "Gompertz": gompertz_growth,
        "Richards": richards_growth,
    }
    # Filter by INCLUDE_MODELS
    model_functions = {k: v for k, v in model_functions.items() if k in INCLUDE_MODELS}

    # Get current maximum weight for biological constraint
    current_max_weight = float(np.max(weights_array))
    # Use a more reasonable constraint: asymptote should be at least 90% of current max weight
    min_asymptote = current_max_weight * 0.9

    # Initial parameter guesses and bounds - more conservative for better fitting
    # Asymptote (K parameter) must be at least 90% of current max weight
    initial_guesses = {
        "Logistic": [1.0, max(45, current_max_weight * 1.1), 0.02, 150],
        "Gompertz": [1.0, max(45, current_max_weight * 1.1), 0.02, 150],
        "Richards": [1.0, max(45, current_max_weight * 1.1), 0.02, 150, 1.5],
    }

    bounds = {
        "Logistic": (
            [0.1, min_asymptote, 0.001, 50],
            [5, min(80, MAX_ASYMPTOTE_LBS / KG_TO_LBS), 0.1, 300],
        ),
        "Gompertz": (
            [0.1, min_asymptote, 0.001, 50],
            [5, min(80, MAX_ASYMPTOTE_LBS / KG_TO_LBS), 0.1, 300],
        ),
        "Richards": (
            [0.1, min_asymptote, 0.001, 50, 0.5],
            [5, min(80, MAX_ASYMPTOTE_LBS / KG_TO_LBS), 0.1, 300, 5],
        ),
    }

    # Fit models
    for name, func in model_functions.items():
        try:
            popt, pcov = curve_fit(
                func,
                days_array,
                weights_array,
                p0=initial_guesses[name],
                bounds=bounds[name],
                maxfev=10000,
                method="trf",  # Trust Region Reflective algorithm
            )
            models[name] = {"params": popt, "cov": pcov, "func": func}
        except Exception as e:
            print(f"Failed to fit {name} model: {e}")

    # Calculate model performance metrics
    model_metrics = {}
    print("Model Performance:")
    for name, model in models.items():
        y_pred = model["func"](days_array, *model["params"])
        r2, rmse, mae = calculate_metrics(weights_array, y_pred)
        model_metrics[name] = {"R²": r2, "RMSE": rmse, "MAE": mae}
        print(
            f"{name}: R² = {r2:.4f}, RMSE = {rmse*KG_TO_LBS:.1f} lbs, MAE = {mae*KG_TO_LBS:.1f} lbs"
        )

    # Calculate confidence intervals for all models
    current_weight = float(weights_array[-1])
    confidence_intervals = {}

    print(f"Calculating {CONFIDENCE_LEVEL*100:.0f}% confidence intervals...")
    # Shared RNG for all bootstraps in this run (stabilizes results across models)
    shared_rng = np.random.default_rng(RANDOM_SEED)

    # Per-model bootstrap
    for name, model in models.items():
        mean_pred, lower, upper = bootstrap_confidence_interval(
            model["func"], days_array, weights_array, n_bootstrap=10000, rng=shared_rng
        )

        if mean_pred is not None:
            # Apply biological constraint: lower bound cannot be below current weight
            # This ensures the final confidence interval is biologically realistic
            lower_constrained = max(lower, current_weight)
            upper_constrained = max(upper, lower_constrained)

            confidence_intervals[name] = {
                "mean": mean_pred,
                "lower": lower_constrained,
                "upper": upper_constrained,
            }
            print(
                f"{name}: {lower_constrained*KG_TO_LBS:.1f} - {upper_constrained*KG_TO_LBS:.1f} lbs (mean: {mean_pred*KG_TO_LBS:.1f} lbs)"
            )

    # Create ensemble model by averaging all available models
    if confidence_intervals:
        print(f"\nCreating ensemble model from {len(confidence_intervals)} models...")

        # Calculate ensemble predictions using actual asymptote parameters (not bootstrap means)
        asymptote_values = []
        for name, model in models.items():
            if name in confidence_intervals:
                asymptote = model["params"][1]  # K parameter (asymptote)
                asymptote_values.append(asymptote)
                print(f"{name} asymptote: {asymptote*KG_TO_LBS:.1f} lbs")

        # Use actual asymptote parameters for the mean
        ensemble_mean = np.mean(asymptote_values)

        # Ensemble bootstrap: average asymptotes across models per replicate
        # Build per-model bootstrap distributions (reuse the same RNG for alignment)
        per_model_boot = {}
        for name, model in models.items():
            m_mean, m_lo, m_hi = bootstrap_confidence_interval(
                model["func"],
                days_array,
                weights_array,
                n_bootstrap=2000,
                rng=shared_rng,
            )
            # We cannot retrieve the full distribution from the helper, so approximate
            # ensemble CI using per-model bounds averaged (already done above) but
            # the shared_rng alignment stabilizes results across runs.

        # Use bootstrap confidence intervals for bounds (stabilized by shared RNG)
        ensemble_lower = np.mean([ci["lower"] for ci in confidence_intervals.values()])
        ensemble_upper = np.mean([ci["upper"] for ci in confidence_intervals.values()])

        # Apply biological constraint to ensemble bounds
        ensemble_lower = max(ensemble_lower, current_weight)
        ensemble_upper = max(ensemble_upper, ensemble_lower)

        # Create ensemble model info
        ensemble_model = {
            "name": "Ensemble (Average)",
            "mean": ensemble_mean,
            "lower": ensemble_lower,
            "upper": ensemble_upper,
            "models": list(confidence_intervals.keys()),
        }

        print(
            f"Ensemble: {ensemble_lower*KG_TO_LBS:.1f} - {ensemble_upper*KG_TO_LBS:.1f} lbs (mean: {ensemble_mean*KG_TO_LBS:.1f} lbs)"
        )
        print(f"Ensemble asymptote average: {ensemble_mean*KG_TO_LBS:.1f} lbs")

        # Use ensemble as our "best" model
        best_model_name = "Ensemble"
        best_model = {"name": "Ensemble", "models": models}
        ci = {"mean": ensemble_mean, "lower": ensemble_lower, "upper": ensemble_upper}

        # Generate final report
        print("\n" + "=" * 70)
        print("FINAL REPORT: POPPY'S GROWTH PROJECTION")
        print("=" * 70)
        print(
            f"Model: {best_model_name} (averaging {len(confidence_intervals)} individual models)"
        )
        print(f"Individual models: {', '.join(confidence_intervals.keys())}")
        print(f"Current age: {days_array[-1]} days ({days_array[-1]/30.44:.1f} months)")
        print(f"Current weight: {current_weight*KG_TO_LBS:.1f} lbs")
        print(f"Predicted adult weight (mean): {ci['mean']*KG_TO_LBS:.1f} lbs")
        print(
            f"{CONFIDENCE_LEVEL*100:.0f}% confidence window: {ci['lower']*KG_TO_LBS:.1f} - {ci['upper']*KG_TO_LBS:.1f} lbs"
        )
        print(f"Range: ±{((ci['upper']-ci['lower'])/2)*KG_TO_LBS:.1f} lbs")

        # Size classification
        mean_weight = ci["mean"]
        if mean_weight < 10:
            size_class = "Toy/Small"
        elif mean_weight < 25:
            size_class = "Small/Medium"
        elif mean_weight < 45:
            size_class = "Medium/Large"
        else:
            size_class = "Large/Giant"

        print(f"\nSize classification: {size_class}")
        print(
            f"Planning recommendation: Use range {ci['lower']*KG_TO_LBS:.1f} - {ci['upper']*KG_TO_LBS:.1f} lbs"
        )

        # Create visualization
        plt.figure(figsize=(12, 7))

        # Great Dane reference band (convert to pounds)
        gd_min_lbs = [w * KG_TO_LBS for w in GREAT_DANE_DATA["weight_min_kg"]]
        gd_max_lbs = [w * KG_TO_LBS for w in GREAT_DANE_DATA["weight_max_kg"]]
        gd_avg_lbs = [w * KG_TO_LBS for w in GREAT_DANE_DATA["weight_avg_kg"]]

        plt.fill_between(
            GREAT_DANE_DATA["age_days"],
            gd_min_lbs,
            gd_max_lbs,
            color="blue",
            alpha=0.08,
            label="Full Great Dane Range",
        )
        plt.plot(
            GREAT_DANE_DATA["age_days"],
            gd_avg_lbs,
            color="blue",
            alpha=0.5,
            label="Great Dane Average",
        )

        # Poppy actuals (convert to pounds)
        weights_lbs_array = weights_array * KG_TO_LBS
        plt.scatter(
            days_array,
            weights_lbs_array,
            color="red",
            s=90,
            marker="*",
            label="Poppy Actual",
        )

        # Ensemble model curve (average of all individual models)
        t_pred = np.linspace(0, 1000, 300)

        # Calculate ensemble prediction by averaging all individual model predictions
        ensemble_predictions = []
        for name, model in models.items():
            if name in confidence_intervals:
                y_pred = model["func"](t_pred, *model["params"])
                ensemble_predictions.append(y_pred)

        # Average all model predictions (convert to pounds)
        y_pred = np.mean(ensemble_predictions, axis=0) * KG_TO_LBS
        plt.plot(
            t_pred,
            y_pred,
            color="#2E8B57",
            linewidth=3,
            label=f"{best_model_name} Model",
        )

        # 80% CI band - create bands for each model and average them
        ensemble_lower_curves = []
        ensemble_upper_curves = []

        for name, model in models.items():
            if name in confidence_intervals:
                # Create confidence bands for this model
                params_lower = model["params"].copy()
                params_upper = model["params"].copy()
                params_lower[1] = confidence_intervals[name]["lower"]
                params_upper[1] = confidence_intervals[name]["upper"]
                y_lower = model["func"](t_pred, *params_lower)
                y_upper = model["func"](t_pred, *params_upper)
                ensemble_lower_curves.append(y_lower)
                ensemble_upper_curves.append(y_upper)

        # Average the confidence bands (convert to pounds)
        y_lower = np.mean(ensemble_lower_curves, axis=0) * KG_TO_LBS
        y_upper = np.mean(ensemble_upper_curves, axis=0) * KG_TO_LBS

        plt.fill_between(
            t_pred,
            y_lower,
            y_upper,
            color="#2E8B57",
            alpha=0.25,
            label=f"{CONFIDENCE_LEVEL*100:.0f}% Confidence Band",
        )

        # Horizontal markers for final CI (convert to pounds)
        plt.axhline(
            y=ci["mean"] * KG_TO_LBS,
            color="#2E8B57",
            linestyle="-",
            linewidth=2,
            label=f"Mean: {ci['mean']*KG_TO_LBS:.1f} lbs",
        )
        plt.axhline(
            y=ci["lower"] * KG_TO_LBS,
            color="#2E8B57",
            linestyle="--",
            alpha=0.7,
            label=f"Lower: {ci['lower']*KG_TO_LBS:.1f} lbs",
        )
        plt.axhline(
            y=ci["upper"] * KG_TO_LBS,
            color="#2E8B57",
            linestyle="--",
            alpha=0.7,
            label=f"Upper: {ci['upper']*KG_TO_LBS:.1f} lbs",
        )

        plt.xlabel("Days Since Birth")
        plt.ylabel("Weight (lbs)")
        plt.title(
            f"Poppy's Growth Projection (Ensemble Model, {CONFIDENCE_LEVEL*100:.0f}% CI) vs Full Great Dane"
        )
        plt.legend(bbox_to_anchor=(1.02, 1), loc="upper left", borderaxespad=0.0)
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        plt.show()

    else:
        print(
            "Could not calculate confidence intervals - insufficient data for bootstrap analysis"
        )


if __name__ == "__main__":
    main()
