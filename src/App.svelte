<script>
	import { onDestroy } from 'svelte';

	// Components
	import RetirementChart from './RetirementChart.svelte';
	import RetirementTable from './RetirementTable.svelte';
	import LinearProgress from '@smui/linear-progress';
	import Paper, { Title, Content } from '@smui/paper';
	import Button, { Label } from '@smui/button';
	import Textfield from '@smui/textfield';
	
	// Utility functions
	import {
		normsInv,
		formatDollarsWithoutCents,
		pv,
		sp500Avg,
		sp500StdDev,
	} from './utils.js';

	// Form Fields
	let currentAge = '';
	let retirementAge = '';
	let currentBalance = '10000';
	let annualContributionAmount = '2000';
	let inflationRate = '3.5';

	// Calculation timer
	let timerTimeout;

	// State toggles
	let calculateStarted = false;
	let calculated = false;
	let validFields = false;
	
	// Enable/Disable calculate button when form fields are filled in
	$: {
		validFields = currentAge.trim() !== '' 
						&& retirementAge.trim() !== '' 
						&& currentBalance.trim() !== '' 
						&& annualContributionAmount.trim() !== '' 
						&& inflationRate.trim() !== '';
	}

	// Final calculation results object
	let calculatedRetirementResults;

	const processTheNumbers = () => {
		// Constants
		const numSimulations = 5000;
		const percentile5 = Math.floor(numSimulations * 0.05);
		const percentile10 = Math.floor(numSimulations * 0.1);
		const percentile25 = Math.floor(numSimulations * 0.25);
		const percentile75 = Math.floor(numSimulations * 0.75);
		const percentile90 = Math.floor(numSimulations * 0.9);

		const calculateMarket = (balance) => {
			return (
				balance +
				balance * (normsInv(Math.random(), sp500Avg, sp500StdDev) * 0.01)
			);
		};

		const calculateContributions = (balance, contributions) => {
			return balance + contributions;
		};

		const sortBalances = (index, simulations) => {
			let simulatedBalances = simulations.map((item) => {
				return item[index].balance;
			});

			simulatedBalances.sort((a, b) => {
				return a - b;
			});

			return simulatedBalances;
		};

		const calculateAverage = (sortedBalances) => {
			let totalBalance = sortedBalances.reduce((acc, item) => {
				return acc + item;
			}, 0);

			return totalBalance / numSimulations;
		};

		const calculateMedian = (sortedBalances) => {
			let middle = Math.floor(sortedBalances.length / 2);

			if (sortedBalances.length % 2 === 0) {
				return sortedBalances[middle];
			}

			return sortedBalances[middle - 1] + sortedBalances[middle] / 2.0;
		};

		const calculateMedianNetPresentValue = (medianValue, numYears) => {
			return pv(medianValue, inflationRate, numYears);
		};

		return new Promise(resolve => {
			clearTimeout(timerTimeout);
			timerTimeout = setTimeout(() => {
				let simulations = [];
				let chartData = [];
				let years = [];
				let calculatedResults = {
					labels: [],
					simulationTotals: [],
					percentiles: []
				};

				for (let i = 0; i < numSimulations; i++) {
					let age = parseInt(currentAge, 10);
					let endAge = parseInt(retirementAge, 10);
					let endBalance = parseFloat(currentBalance);
					let annualContributions = parseFloat(annualContributionAmount);
					let currentYear = new Date().getFullYear();

					years.push({
						year: currentYear,
						age: age,
						balance: endBalance,
					});

					while (age < endAge) {
						endBalance = calculateContributions(
							calculateMarket(endBalance),
							annualContributions
						);

						years.push({
							year: ++currentYear,
							age: ++age,
							balance: endBalance,
						});
					}

					simulations[i] = [...years];
					years = [];
				}

				let startAge = parseInt(currentAge, 10);
				let numYears = parseInt(retirementAge, 10) - startAge + 1;
				let currentYear = new Date().getFullYear();

				for (let i = 0; i < numYears; i++) {
					let sortedBalances = sortBalances(i, simulations);
					let totalMedian = calculateMedian(sortedBalances);

					calculatedResults.simulationTotals[i] = {
						year: currentYear,
						age: startAge,
						mean: formatDollarsWithoutCents(calculateAverage(sortedBalances)), 
						median: formatDollarsWithoutCents(totalMedian),
						medianNetPresentValue: formatDollarsWithoutCents(
							calculateMedianNetPresentValue(totalMedian, i)
						),
						percentile5: formatDollarsWithoutCents(sortedBalances[percentile5]),
						percentile10: formatDollarsWithoutCents(sortedBalances[percentile10]),
						percentile25: formatDollarsWithoutCents(sortedBalances[percentile25]),
						percentile75: formatDollarsWithoutCents(sortedBalances[percentile75]),
						percentile90: formatDollarsWithoutCents(sortedBalances[percentile90]),
					};

					chartData[i] = {
						year: currentYear,
						median: Math.round(totalMedian),
						percentile5: Math.round(sortedBalances[percentile5]),
						percentile10: Math.round(sortedBalances[percentile10]),
						percentile25: Math.round(sortedBalances[percentile25]),
						percentile75: Math.round(sortedBalances[percentile75]),
						percentile90: Math.round(sortedBalances[percentile90])
					};

					currentYear++;
					startAge++;
				}

				calculatedResults.labels = chartData.map((item) => {
					return item.year;
				});

				calculatedResults.percentiles = chartData.reduce(
					(acc, item) => {
						return {
							percentile5: [...acc.percentile5 || [], item.percentile5],
							percentile10: [...acc.percentile10 || [], item.percentile10],
							percentile25: [...acc.percentile25 || [], item.percentile25],
							median: [...acc.median || [], item.median],
							percentile75: [...acc.percentile75 || [], item.percentile75],
							percentile90: [...acc.percentile90 || [], item.percentile90],
						};
					},
					{}
				);
				
				resolve(calculatedResults);
			}, 2000);
  		});
	}

	const calculateResults = async () => {
		let calculatedResults = await processTheNumbers();
		calculated = true;
		return calculatedResults;
	}

	const calculate = () => {
		calculateStarted = true;
		calculatedRetirementResults = calculateResults();
	};

	onDestroy(() => {
		clearTimeout(timerTimeout);
  	});

</script>

<style>
	.container {
		display: flex;
		flex-direction: row;

	}
	.loading {
		margin: 25px auto;
	}

	.loading span {
		font-family: 'Roboto', sans-serif;
		font-size: 1rem;
	}

	.retirement-form {
		order: 1;
		margin: 25px;
		width: 300px;
	}

	.calculation-results {
		min-width: 900px;
		order: 2;
	}

	.loading {
		width: 100%;
	}

	.loading span {
		font-size: 10px;
	}

	.retirement-chart,
	.retirement-table {
		margin: 25px auto;
	}

	:global(.field-style) {
		margin-top: 15px;
		width: 100%;
	}

	:global(.button-style) {
		margin-top: 20px;
		width: 100%;
	}

	@keyframes fadeInUp {
		from {
			transform: translate3d(0,40px,0)
		}

		to {
			transform: translate3d(0,0,0);
			opacity: 1
		}
	}

	@-webkit-keyframes fadeInUp {
		from {
			transform: translate3d(0,40px,0)
		}

		to {
			transform: translate3d(0,0,0);
			opacity: 1
		}
	}

	.animated {
		animation-duration: 1s;
		animation-fill-mode: both;
		-webkit-animation-duration: 1s;
		-webkit-animation-fill-mode: both
	}

	.animatedFadeInUp {
		opacity: 0
	}

	.fadeInUp {
		opacity: 0;
		animation-name: fadeInUp;
		-webkit-animation-name: fadeInUp;
	}
</style>

<main>
	<div class="container">
		<div class="retirement-form">
			<Paper>
				<Title>Retirement Calculator</Title>
				<Content>
					{#if calculateStarted && !calculated}
						<Textfield
							disabled
							class="field-style"
							variant="outlined"
							bind:value={currentAge}
							label="Current Age"
							input$aria-controls="helper-text-outlined-a"
							input$aria-describedby="helper-text-outlined-a" />
					{:else}
						<Textfield
							class="field-style"
							variant="outlined"
							bind:value={currentAge}
							label="Current Age"
							input$aria-controls="helper-text-outlined-a"
							input$aria-describedby="helper-text-outlined-a" />
					{/if}
					{#if calculateStarted && !calculated}
						<Textfield
							disabled
							class="field-style"
							variant="outlined"
							bind:value={retirementAge}
							label="Retirement Age"
							input$aria-controls="helper-text-outlined-a"
							input$aria-describedby="helper-text-outlined-a" />
					{:else}
						<Textfield
							class="field-style"
							variant="outlined"
							bind:value={retirementAge}
							label="Retirement Age"
							input$aria-controls="helper-text-outlined-a"
							input$aria-describedby="helper-text-outlined-a" />
					{/if}
					{#if calculateStarted && !calculated}
						<Textfield
							disabled
							class="field-style"
							variant="outlined"
							bind:value={currentBalance}
							label="Current Savings Balance"
							input$aria-controls="helper-text-outlined-a"
							input$aria-describedby="helper-text-outlined-a" />
					{:else}
						<Textfield
							class="field-style"
							variant="outlined"
							bind:value={currentBalance}
							label="Current Savings Balance"
							input$aria-controls="helper-text-outlined-a"
							input$aria-describedby="helper-text-outlined-a" />
					{/if}
					{#if calculateStarted && !calculated}
						<Textfield
							disabled
							class="field-style"
							variant="outlined"
							bind:value={annualContributionAmount}
							label="Annual Contribution Amount"
							input$aria-controls="helper-text-outlined-a"
							input$aria-describedby="helper-text-outlined-a" />
					{:else}
						<Textfield
							class="field-style"
							variant="outlined"
							bind:value={annualContributionAmount}
							label="Annual Contribution Amount"
							input$aria-controls="helper-text-outlined-a"
							input$aria-describedby="helper-text-outlined-a" />
					{/if}
					{#if calculateStarted && !calculated}
						<Textfield
							disabled
							class="field-style"
							variant="outlined"
							bind:value={inflationRate}
							label="Inflation Rate"
							input$aria-controls="helper-text-outlined-a"
							input$aria-describedby="helper-text-outlined-a" />
					{:else}
						<Textfield
							class="field-style"
							variant="outlined"
							bind:value={inflationRate}
							label="Inflation Rate"
							input$aria-controls="helper-text-outlined-a"
							input$aria-describedby="helper-text-outlined-a" />
					{/if}
					{#if (calculateStarted && !calculated) || !validFields}
						<Button disabled class="button-style" variant="raised" on:click={calculate}>
							<Label>Calculate It!</Label>
						</Button>
					{:else}
						<Button class="button-style" variant="raised" on:click={calculate}>
							<Label>Calculate It!</Label>
						</Button>
					{/if}
				</Content>
			</Paper>
		</div>
		<div class="calculation-results">
			{#if calculateStarted}
				{#await calculatedRetirementResults}
					<div class="loading">
						<LinearProgress indeterminate />
						<span>Running Monte Carlo Simulations ...</span>
					</div>
				{:then calculatedRetirementResults}
					{#if calculated}
						<div class="retirement-chart animated animatedFadeInUp fadeInUp">
							<RetirementChart labels={calculatedRetirementResults.labels} percentiles={calculatedRetirementResults.percentiles} />
						</div>
						<div class="retirement-table animated animatedFadeInUp fadeInUp">
							<RetirementTable data={calculatedRetirementResults.simulationTotals} />
						</div>
					{/if}
				{:catch error}
					<p style="color: red;">{error.message}</p>
				{/await}
			{/if}
		</div>
	</div>
</main>
