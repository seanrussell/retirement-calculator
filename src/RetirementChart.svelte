<script>
    export let labels;
	export let percentiles;

	import { onMount } from 'svelte';
	import Paper, { Title, Subtitle, Content } from '@smui/paper';
	import Chart from 'chart.js';

	let generateRetirementChart = () => {
		let datasets = [];

		datasets.push({
			label: '5%',
			borderColor: 'rgb(22, 66, 91)',
			backgroundColor: 'rgb(22, 66, 91)',
			data: percentiles.percentile5,
		});

		datasets.push({
			label: '10%',
			borderColor: 'rgb(47, 102, 144)',
			backgroundColor: 'rgb(47, 102, 144)',
			data: percentiles.percentile10,
		});

		datasets.push({
			label: '25%',
			borderColor: 'rgb(58, 124, 165)',
			backgroundColor: 'rgb(58, 124, 165)',
			data: percentiles.percentile25,
		});

		datasets.push({
			label: 'Median',
			borderColor: 'rgb(129, 195, 215)',
			backgroundColor: 'rgb(129, 195, 215)',
			data: percentiles.median,
		});

		datasets.push({
			label: '75%',
			borderColor: 'rgb(217, 220, 214)',
			backgroundColor: 'rgb(217, 220, 214)',
			data: percentiles.percentile75,
		});

		datasets.push({
			label: '90%',
			borderColor: 'rgb(245, 246, 244)',
			backgroundColor: 'rgb(245, 246, 244)',
			data: percentiles.percentile90,
		});

		let config = {
			type: 'line',
			data: {
				labels: labels,
				datasets: datasets,
			},
			options: {
				responsive: true,
				title: {
					display: true,
					text: 'Hypothetical Growth',
				},
				tooltips: {
                    enabled: true,
                    callbacks: {
                        label: function(tooltipItem, data) {
                            var label = data.datasets[tooltipItem.datasetIndex].label || '';

                            if (label) {
                                label += ': ';
                            }
                            label += '$' + tooltipItem.yLabel.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
                            return label;
                        }
                    }
				},
				hover: {
					mode: 'index',
				},
				scales: {
					xAxes: [
						{
							scaleLabel: {
								display: true,
								labelString: 'Year',
							},
						},
					],
					yAxes: [
						{
							stacked: false,
							scaleLabel: {
								display: true,
								labelString: 'Balance',
                            },
                            ticks: {
                                callback: function(value, index, values) {
                                    return '$' + value.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
                                }
                            }
						},
					],
                },
                animation: {
                    duration: 750
                }
			}
		};

        let ctx = document.getElementById('retirementChart');
		let retirementChart = new Chart(ctx, config);
	}

	onMount(generateRetirementChart);
</script>

<Paper>
    <Title>Simulated Growth</Title>
    <Subtitle>Displaying the 5th, 10th, 25th, Median, 75th and 90th percentiles.</Subtitle>
    <Content><canvas id="retirementChart" width="800" height="500" /></Content>
</Paper>
