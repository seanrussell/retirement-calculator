<script>
	export let data;

	import Paper, { Title, Subtitle, Content } from '@smui/paper';
	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
</script>

<Paper>
	<Title>Tabulated Results</Title>
	<Subtitle>
		Displaying the 5th, 10th, 25th, Median, 75th, and 90th percentiles.
	</Subtitle>
	<Content>
		<DataTable table$aria-label="Products">
			<Head>
				<Row>
					<Cell>Year (Age)</Cell>
					<Cell>5th Percentile</Cell>
					<Cell>10th Percentile</Cell>
					<Cell>25th Percentile</Cell>
					<Cell>Median (Net Present Value)</Cell>
					<Cell>75th Percentile</Cell>
					<Cell>90th Percentile</Cell>
				</Row>
			</Head>
			<Body>
				{#each data as simulation}
					<Row>
						<Cell>
							<strong>{simulation.year}</strong>
							(Age:
							{simulation.age})
						</Cell>
						<Cell>{simulation.percentile5}</Cell>
						<Cell>{simulation.percentile10}</Cell>
						<Cell>{simulation.percentile25}</Cell>
						<Cell>
							{simulation.median}
							(<strong>{simulation.medianNetPresentValue}</strong>)
						</Cell>
						<Cell>{simulation.percentile75}</Cell>
						<Cell>{simulation.percentile90}</Cell>
					</Row>
				{/each}
			</Body>
		</DataTable>
	</Content>
</Paper>
