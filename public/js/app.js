var Main = React.createClass({
	loadStatsFromServer: function() {
		$.ajax({
			url: '/stats',
			dataType: 'json',
			success: function(data) {
				sortedPlayers = _.sortBy(data, function(player) {
					return Number(player.number);
				});
				this.setState({data: sortedPlayers});
			}.bind(this),
			error: function(xhr, status, err) {
        console.error('/stats', status, err.toString());
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
	handleShotChartSubmit: function(FGAttempt) {
		var players = this.state.data;
		var i = _.findIndex(players, function(p) {
			return p.number === FGAttempt.number;
		});
		players[i].attemptedFG.push(_.omit(FGAttempt, 'number'));
		this.setState({data: players}, function() {
			$.ajax({
        url: '/stats/recordShot',
        dataType: 'json',
        type: 'POST',
        data: FGAttempt,
        success: function(data) {
          this.setState({data: data});
        }.bind(this),
        error: function(xhr, status, err) {
          console.error('/stats/shot', status, err.toString());
        }.bind(this)
      });
		});
	},
	handleResetStats: function() {
		var resetObject = {
			attemptedFG: [],
			attemptedFT: [],
			rebounds: "0",
			assists: "0",
			steals: "0",
			blocks: "0",
			turnovers: "0",
			fouls: "0"
		};
		var players = this.state.data;
		_.forEach(players, function(player) {
			_.assign(player, resetObject);
		});
		// this.setState({data: players}, function() {
			$.ajax({
				url: '/stats/reset',
				dataType: 'json',
				type: 'PUT',
				success: function(data) {
					this.setState({data: data});
				}.bind(this),
        error: function(xhr, status, err) {
          console.error('/stats/reset', status, err.toString());
        }.bind(this)
			});
		// });
	},
	render: function() {
		return (
			<div className="main">
				<Clock />
				<CurrentPlayers />
				<ShotChart data={this.state.data} onShotChartSubmit={this.handleShotChartSubmit} ref="shotChart"/>
				<OtherStats />
				<BoxScore data={this.state.data} onResetStats={this.handleResetStats} />
			</div>
		);
	}
});

var ShotChart = React.createClass({
	player: null,
	posX: null,
	posY: null,
	modalX: null,
	modalY: null,
	made: false,
	getInitialState: function() {
		return {showShooterModal: false, showAssisterModal: false, showShotMap: false};
	},
	handleClick: function(e) {
		e.preventDefault();
		if(this.state.showShooterModal || this.state.showAssisterModal)
			return;
		this.posX = e.pageX - $(".shot-chart").offset().left - 337;
		this.posY = -(e.pageY - $(".shot-chart").offset().top);
		this.modalX = e.pageX;
		this.modalY = e.pageY;
		this.setState({showShooterModal: true});
	},
	handleShooterSubmit: function(data) {
		if(!data.made) {
			this.props.onShotChartSubmit({number: data.player, x: this.posX, y: this.posY, made: data.made});
			this.reset();
		}
		else {
			this.player = data.player;
			this.made = data.made;
			this.setState({showShooterModal: false, showAssisterModal: true});
		}
	},
	handleAssisterSubmit: function(data) {
		this.props.onShotChartSubmit({number: this.player, x: this.posX, y: this.posY, made: this.made, assistedBy: data.assister});
		this.reset();
	},
	toggleShotMap: function(e) {
		e.preventDefault();
		e.stopPropagation();
		var show = !this.state.showShotMap;
		this.setState({showShotMap: show});
	},
	reset: function() {
		this.posX = null;
		this.posY = null;
		modalX: null;
		modalY: null;
		this.player = null;
		this.made = false;
		this.setState({showShooterModal: false, showAssisterModal: false, showShotMap: false});
	},
	render: function() {
		return (
			<div className="shot-chart" onClick={this.handleClick}>
				<img src="/img/shot_chart.png" />
				<button className="toggle-btn" onClick={this.toggleShotMap}>Toggle Shot Map</button>
				{this.state.showShotMap ? <ShotChartMap data={this.props.data} /> : null}
				{this.state.showShooterModal ?
				 <ShotChartShooterModal data={this.props.data}
				 												modalX={this.modalX}
				 												modalY={this.modalY}
				 												onShooterSubmit={this.handleShooterSubmit} /> : null}
				{this.state.showAssisterModal ?
				 <ShotChartAssisterModal data={this.props.data}
				 												 modalX={this.modalX}
				 												 modalY={this.modalY}
				 												 shooter={this.player}
				 												 onAssisterSubmit={this.handleAssisterSubmit} /> : null}
			</div>
		);
	}
});

var ShotChartMap = React.createClass({
	render: function() {
		return (
			<div className="shot-chart-map">
				{this.props.data.map(function(player) {
					return (
						<ShotMarkerArray player={player} key={player.number} />
					);
				})}
			</div>
		);
	}
});

var ShotMarkerArray = React.createClass({
	render: function() {
		return (
			<div className="shot-marker-array">
				{this.props.player.attemptedFG.map(function(fg, index) {
					return (
						<ShotMarker fg={fg} key={index}/>
					);
				})}
			</div>
		);
	}
});

var ShotMarker = React.createClass({
	componentDidMount: function() {
		$(React.findDOMNode(this.refs.shot)).css({
			left: Number(this.props.fg.x) + 337,
			top: -(this.props.fg.y)
		});
		//$(React.findDOMNode(this.refs.shot)).css('top', this.props.fg.y);
	},
	render: function() {
		if(this.props.fg.made === "true") {
			var markerClass = "made-shot";
			var faClass = "fa fa-circle";
		}
		else {
			var markerClass = "missed-shot";
			var faClass = "fa fa-times";
		}
		return (
			<div className={markerClass} ref="shot">
				<i className={faClass}></i>
			</div>
		);
	}
});

var ShotChartShooterModal = React.createClass({
	getInitialState: function() {
		return {showShooterOptions: true};
	},
	componentDidMount: function() {
		$(".shot-chart-modal").css({
			left: this.props.modalX,
			top: this.props.modalY
		});
	},
	handleSelectPlayerFocus: function(e) {
		e.preventDefault();
		this.setState({showShooterOptions: true});
		shooterDropdown = document.getElementById("shooter-options");
		_.forEach(this.props.data, function(player) {
			shooterDropdown.options.add(new Option('#'+player.number+' '+player.name, player.number));
		});
	},
	handleMadeClick: function(e) {
		e.preventDefault();
		var shooter = this.refs.shooterSelect.getDOMNode().value;
		this.props.onShooterSubmit({player: shooter, made: true});
		this.refs.shooterSelect.getDOMNode().value = '';
	},
	handleMissedClick: function(e) {
		e.preventDefault();
		var shooter = this.refs.shooterSelect.getDOMNode().value;
		this.props.onShooterSubmit({player: shooter, made: false});
		this.refs.shooterSelect.getDOMNode().value = '';
	},
	render: function() {
		return (
			<div>
				<div className="modal-bg modal-bg-clear"></div>
				<div className="shot-chart-modal">
					<span>Who took the shot?</span>
					<select id="shooter-options" onFocus={this.handleSelectPlayerFocus} ref="shooterSelect">
						<option value="" disabled selected>Select player...</option>
					</select>
					<button className="made-btn" onClick={this.handleMadeClick}>MADE</button>
					<button className="missed-btn" onClick={this.handleMissedClick}>MISSED</button>
				</div>
			</div>
		);
	}
});

var ShotChartAssisterModal = React.createClass({
	getInitialState: function() {
		return {showAssisterOptions: false};
	},
	componentDidMount: function() {
		$(".shot-chart-modal").css({
			left: this.props.modalX,
			top: this.props.modalY
		});
	},
	handleSelectAssisterFocus: function(e) {
		e.preventDefault();
		this.setState({showAssisterOptions: true});
		var _this = this;
		var assisterOptions = _.filter(this.props.data, function(player) {
			return player.number !== _this.props.shooter;
		});
		assisterDropdown = document.getElementById("assister-options");
		_.forEach(assisterOptions, function(assister) {
			assisterDropdown.options.add(new Option('#'+assister.number+' '+assister.name, assister.number));
		});
	},
	handleDoneClick: function(e) {
		e.preventDefault();
		var assister = this.refs.assisterSelect.getDOMNode().value;
		this.props.onAssisterSubmit({assister: assister});
		this.refs.assisterSelect.getDOMNode().value='';
	},
	handleNoAssistClick: function(e) {
		e.preventDefault();
		this.props.onAssisterSubmit({assister: null});
	},
	render: function() {
		return (
			<div>
				<div className="modal-bg modal-bg-clear"></div>
				<div className="shot-chart-modal">
					<span>Who Assisted?</span>
					<select id="assister-options" onFocus={this.handleSelectAssisterFocus} ref="assisterSelect">
						<option value="" disabled selected>Select player...</option>
					</select>
					<button className="done-btn" onClick={this.handleDoneClick}>DONE</button>
					<button className="done-btn" onClick={this.handleNoAssistClick}>No Assist</button>
				</div>
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
	resetStats: function() {
		this.props.onResetStats();
	},
	render: function() {
		return (
			<div>
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
						{this.props.data.map(function(player, index) {
							return <BoxScoreRow player={player} key={player.number}/>
						})}
					</table>
				</div>
				<button onClick={this.resetStats}>RESET STATS</button>
			</div>
		);
	}
});

var BoxScoreRow = React.createClass({
	render: function() {
		var player = this.props.player;
		var attemptedFG = player.attemptedFG.length;
		var madeFG = _.filter(player.attemptedFG, function(fg) {
			return fg.made === "true";
		}).length;
		var attemptedThreesList = _.filter(player.attemptedFG, function(fg) {
			return (Math.pow(Number(fg.x), 2) + Math.pow(Number(fg.y), 2)) > 90000;
		})
		var attemptedThrees = attemptedThreesList.length;
		var madeThrees = _.filter(attemptedThreesList, function(fg) {
			return fg.made === "true";
		}).length;
		var attemptedFT = player.attemptedFT.length;
		var madeFT = _.filter(player.attemptedFT, function(ft) {
			return ft.made === "true";
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
	}
});

React.render(
	<Main pollInterval={200} />,
	document.getElementById('stat-tracker')
);