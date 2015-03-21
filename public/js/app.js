var Main = React.createClass({
	loadStatsfromServer: function() {
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			success: function(data) {
				this.setState({data: data});
			}.bind(this),
			error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
		});
	},
	getInitialState: function() {
		return {data: []};
	},
	componentDidMount: function() {
		this.loadStatsFromServer();
    setInterval(this.loadStatsFromServer, this.props.pollInterval);
	},
	render: function() {
		return (
			<div className="main">
				<Clock />
				<CurrentPlayers />
				<ShotChart />
				<OtherStats />
				<BoxScore data={this.state.data} />
			</div>
		);
	}
});

var ShotChart = React.createClass({
	render: function() {
		return (
			<div className="shot-chart">
				Hello, this is the shot chart.
			</div>
		);
	}
});

var OtherStats = React.createClass({
	render: function() {
		return (
			<div className="other-stats">
				Enter non-shooting stats here.
			</div>
		);
	}
});

var Clock = React.createClass({
	render: function() {
		return (
			<div className="clock">
				Tick tock, tick tock.
			</div>
		);
	}
});

var CurrentPlayers = React.createClass({
	render: function() {
		return (
			<div className="current-players">
				These 5 are on the floor.
			</div>
		);
	}
});

var BoxScore = React.createClass({
	render: function() {
		var rows = this.data.props.map(function(player, index) {
			var madeFG = _.filter(player.attemptedFG, function(fg) {
				return fg.made === true;
			}).length;
			var attemptedThreesList = _.filter(player.attemptedFG, function(fg) {
				return (Math.pow(fg.x, 2) + Math.pow(fg.y, 2)) > 400;
			})
			var attemptedThrees = attemptedThreesList.length;
			var madeThrees = _.filter(attemptedThreesList, function(fg) {
				return fg.made === true;
			}).length;
			var madeFT = _.filter(player.attemptedFT, function(ft) {
				return ft.made === true;
			}).length;
			var points = (madeFG - madeThrees) * 2 + madeThrees * 3 + madeFT;

			return (
				<tr>
					<td>{player.number}</td>
					<td>{player.name}</td>
					<td>{madeFG}</td>
					<td>{player.attemptedFG.length}</td>
					<td>{madeThrees}</td>
					<td>{attemptedThrees}</td>
					<td>{madeFT}</td>
					<td>{player.attemptedFT.length}</td>
					<td>{points}</td>
					<td>{player.rebounds}</td>
					<td>{player.assists}</td>
					<td>{player.steals}</td>
					<td>{player.blocks}</td>
					<td>{player.turnovers}</td>
					<td>{player.fouls}</td>
				</tr>
			);
		});
		return (
			<div className="box-score">
				<table>
					<th>
					{rows}
			</div>
		);
	}
});

React.render(
	<Main url="stats.json" pollInterval={200} />,
	document.getElementById('stat-tracker')
);