var Main = React.createClass({
	loadStatsFromServer: function() {
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			type: 'GET',
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
	handleShotChartClick: function(coordinates) {
		var players = this.state.data;
		players[0].attemptedFG.push({x: coordinates.x, y: coordinates.y, made: true, assisted: false});
		this.setState({data: players}, function() {
			$.ajax({
        url: this.props.url,
        dataType: 'json',
        type: 'PUT',
        data: {x: coordinates.x, y: coordinates.y, made: true, assisted: false},
        success: function(data) {
          this.setState({data: data});
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(this.props.url, status, err.toString());
        }.bind(this)
      });
		});
	},
	render: function() {
		return (
			<div className="main">
				<Clock />
				<CurrentPlayers />
				<ShotChart data={this.state.data} onShotChartClick={this.handleShotChartClick} />
				<OtherStats />
				<BoxScore data={this.state.data} />
			</div>
		);
	}
});

var ShotChart = React.createClass({
	handleClick: function(e) {
		e.preventDefault();
		var posX = e.pageX - $(".shot-chart").offset().left;
		var posY = e.pageY - $(".shot-chart").offset().top;
		alert(posX + ',' + posY);
		this.props.onShotChartClick({x: posX, y: posY});
	},
	render: function() {
		return (
			<div className="shot-chart" onClick={this.handleClick}>
				<img src="/img/shot_chart.png" />
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
		var rows = this.props.data.map(function(player, index) {
			var attemptedFG = player.attemptedFG.length;
			var madeFG = _.filter(player.attemptedFG, function(fg) {
				return fg.made === true;
			}).length;
			var attemptedThreesList = _.filter(player.attemptedFG, function(fg) {
				return (Math.pow(fg.x, 2) + Math.pow(fg.y, 2)) > 90000;
			})
			var attemptedThrees = attemptedThreesList.length;
			var madeThrees = _.filter(attemptedThreesList, function(fg) {
				return fg.made === true;
			}).length;
			var attemptedFT = player.attemptedFT.length;
			var madeFT = _.filter(player.attemptedFT, function(ft) {
				return ft.made === true;
			}).length;
			var points = (madeFG - madeThrees) * 2 + madeThrees * 3 + madeFT;
			return (
				<tr className="box-score-row">
					<td>{player.number}</td>
					<td>{player.name}</td>
					<td>{madeFG}-{attemptedFG}</td>
					<td>{madeThrees}-{attemptedThrees}</td>
					<td>{madeFT}-{attemptedFT}</td>
					<td>{player.rebounds}</td>
					<td>{player.assists}</td>
					<td>{player.steals}</td>
					<td>{player.blocks}</td>
					<td>{player.turnovers}</td>
					<td>{player.fouls}</td>
					<td>{points}</td>
				</tr>
			);
		});
		return (
			<div className="box-score">
				<table className="box-score-table">
					<tr className="box-score-header">
						<th>#</th>
						<th>Name</th>
						<th>FG</th>
						<th>3PT</th>
						<th>FT</th>
						<th>REB</th>
						<th>AST</th>
						<th>STL</th>
						<th>BLK</th>
						<th>TO</th>
						<th>PF</th>
						<th>PTS</th>
					</tr>
					{rows}
				</table>
			</div>
		);
	}
});

React.render(
	<Main url="stats.json" pollInterval={200} />,
	document.getElementById('stat-tracker')
);