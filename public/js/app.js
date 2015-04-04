//React Bootstrap Init
var Button = ReactBootstrap.Button;
var ButtonGroup = ReactBootstrap.ButtonGroup;
var ButtonToolbar = ReactBootstrap.ButtonToolbar;
var DropdownButton = ReactBootstrap.DropdownButton;
var OverlayTrigger = ReactBootstrap.OverlayTrigger;
var MenuItem = ReactBootstrap.MenuItem;
var Tooltip = ReactBootstrap.Tooltip;
var ReactBootstrapSelect = ReactBootstrap.Select;

var Main = React.createClass({
	loadStatsFromServer: function() {
		$.ajax({
			url: '/stats',
			dataType: 'json',
			success: function(data) {
				this.setState({data: data});
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
    $(document).keydown(function(e) {
			if(e.which === 9) {
				e.preventDefault();
				$('#stat-command-input').focus();
				$('#stat-command-input').value='';
			}
			else if(e.which >= 48 && e.which <= 90 && e.target.id !== '#stat-command-input') {
				$('#stat-command-input').focus();
				$('#stat-command-input').value=String.fromCharCode(e.which);
			}
			else
				return;
		});
	},
	handleRecordShot: function(FGAttempt) {
		$.ajax({
		  url: '/stats/recordShot',
		  dataType: 'json',
		  type: 'POST',
		  data: FGAttempt,
		  success: function(data) {
		    this.setState({data: data});
		  }.bind(this),
		  error: function(xhr, status, err) {
		    console.error('/stats/recordShot', status, err.toString());
		  }.bind(this)
		});
	},
	handleRecordFT: function(data) {
		$.ajax({
		  url: '/stats/recordFT',
		  dataType: 'json',
		  type: 'POST',
		  data: data,
		  success: function(data) {
		    this.setState({data: data});
		  }.bind(this),
		  error: function(xhr, status, err) {
		    console.error('/stats/recordFT', status, err.toString());
		  }.bind(this)
		});
	},
	handleRecordStat: function(player, stat) {
		$.ajax({
      url: '/stats/recordStat',
      dataType: 'json',
      type: 'POST',
      data: {number: player, stat: stat},
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error('/stats/recordStat', status, err.toString());
      }.bind(this)
    });
	},
	handleSubPlayer: function(player) {
		$.ajax({
			url: '/stats/subPlayer',
			dataType: 'json',
			type: 'PUT',
			data: {number: player},
			success: function(data) {
				this.setState({data: data});
			}.bind(this),
      error: function(xhr, status, err) {
        console.error('/stats/subPlayer', status, err.toString());
      }.bind(this)
		});
	},
	handleResetStats: function() {
		if(window.confirm("Are you sure?")) {
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
		}
		else
			React.findDOMNode(this.refs.resetButton).blur();
	},
	render: function() {
		return (
			<div className="main">
				<div id="left-column">
					<div id="logo"><img src="/img/logo.png"/></div>
					<CurrentPlayers data={this.state.data} onSubPlayer={this.handleSubPlayer} />
					<BoxScore data={this.state.data} onSubPlayer={this.handleSubPlayer} />
				</div>
				<div id="right-column">
					<ShotChart data={this.state.data} onRecordShot={this.handleRecordShot} onRecordFT={this.handleRecordFT} ref="shotChart"/>
					<NonShootingStatsInput data={this.state.data}
																	onRecordStat={this.handleRecordStat}
																	onRecordCommandFT={this.handleRecordFT}
																	ref="statsInput" />
				</div>
				<button className="btn btn-danger reset-btn" onClick={this.handleResetStats} ref="resetButton">
					<i className="fa fa-fw fa-refresh"></i> RESET STATS
				</button>
			</div>
		); //<Clock />
	}
});

// var Clock = React.createClass({
// 	clock: null,
// 	componentDidMount: function() {
// 	},
// 	startClock: function() {
// 		this.clock.start();
// 	},
// 	stopClock: function() {
// 		this.clock.stop();
// 	},
// 	resetClock: function() {
// 		this.clock.setTime(1200);
// 	},
// 	render: function() {
// 		return (
// 			<div className="clock-container">
// 				<Button bsStyle="success" bsSize="xsmall" onClick={this.startClock}>
// 					<i className="fa fa-fw fa-play"></i>
// 				</Button>
// 				<Button bsStyle="warning" bsSize="xsmall" onClick={this.stopClock}>
// 					<i className="fa fa-fw fa-pause"></i>
// 				</Button>
// 				<Button bsStyle="danger" bsSize="xsmall" onClick={this.resetClock}>
// 					<i className="fa fa-fw fa-refresh"></i>
// 				</Button>
// 				<div className="clock"></div>
// 			</div>
// 		);
// 	}
// });

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
			this.props.onRecordShot({number: data.player, x: this.posX, y: this.posY, made: data.made});
			this.reset();
		}
		else {
			this.player = data.player;
			this.made = data.made;
			this.setState({showShooterModal: false, showAssisterModal: true});
		}
	},
	handleAssisterSubmit: function(data) {
		this.props.onRecordShot({number: this.player, x: this.posX, y: this.posY, made: this.made, assistedBy: data.assister});
		this.reset();
	},
	handleRecordFT: function(data) {
		this.props.onRecordFT(data);
	},
	toggleShotMap: function(e) {
		e.preventDefault();
		e.stopPropagation();
		var show = !this.state.showShotMap;
		this.setState({showShotMap: show});
		React.findDOMNode(this.refs.toggleButton).blur();
	},
	reset: function() {
		this.posX = null;
		this.posY = null;
		modalX: null;
		modalY: null;
		this.player = null;
		this.made = false;
		this.setState({showShooterModal: false, showAssisterModal: false});
	},
	render: function() {
		return (
			<div className="shot-chart-container">
				<div className="shot-chart-title">SHOT CHART</div>
				<div className="shot-chart" onClick={this.handleClick}>
					<img src="/img/shot_chart.png" />
					<FreeThrowInput data={this.props.data} onRecordFT={this.handleRecordFT} ref="ftInput" />
					<button className="btn btn-sm btn-info toggle-btn" onClick={this.toggleShotMap} ref="toggleButton">
						<i className="fa fa-fw fa-bullseye"></i> Toggle Shot Map
					</button>
					{this.state.showShotMap ? <ShotChartMap data={this.props.data} /> : null}
					{this.state.showShooterModal ?
					 <ShotChartShooterModal data={this.props.data}
					 												modalX={this.modalX}
					 												modalY={this.modalY}
					 												onShooterSubmit={this.handleShooterSubmit}
					 												onCancelModal={this.reset} /> : null}
					{this.state.showAssisterModal ?
					 <ShotChartAssisterModal data={this.props.data}
					 												 modalX={this.modalX}
					 												 modalY={this.modalY}
					 												 shooter={this.player}
					 												 onAssisterSubmit={this.handleAssisterSubmit}
					 												 onCancelModal={this.reset} /> : null}
				</div>
			</div>
		);
	}
});

var FreeThrowInput = React.createClass({
	getInitialState: function() {
		return {playerSelected: null};
	},
	toggleFreeThrow: function(e) {
		e.preventDefault();
		e.stopPropagation();
		if(this.state.playerSelected)
			this.setState({playerSelected: null});
	},
	handleSelectPlayer: function(player) {
		this.setState({playerSelected: player});
		$('.dropdown-menu li a').css('outline', 'none');
	},
	handleMadeClick: function(e) {
		e.preventDefault();
		e.stopPropagation();
		this.props.onRecordFT({number: this.state.playerSelected, made: true});
		$('.free-throw-input').click();
	},
	handleMissedClick: function(e) {
		e.preventDefault();
		e.stopPropagation();
		this.props.onRecordFT({number: this.state.playerSelected, made: false});
		$('.free-throw-input').click();
	},
	render: function() {
		return (
			<div className="free-throw-input" onClick={this.toggleFreeThrow}>
				<DropdownButton className="free-throw-toggle" bsStyle="primary" title="Free Throw" dropup>
					{this.props.data.map(function(player, i) {
						if(player.active === "true")
							return (
								<MenuItem className="free-throw-option"
											onClick={this.handleSelectPlayer.bind(this,player.number)}
											eventKey={i}
											key={i}>
									{this.state.playerSelected === player.number ?
										<div>
											<Button bsStyle="success"
															bsSize="xsmall"
															onClick={this.handleMadeClick}
															style={{marginRight: '10px'}}>
												MADE
											</Button>
											<Button bsStyle="danger"
															bsSize="xsmall"
															onClick={this.handleMissedClick}>
												MISSED
											</Button>
										</div> :
										"#" + player.number + " " + player.name}
								</MenuItem>
							);
					}.bind(this))}
				</DropdownButton>
			</div>
		);
	}
});

var ShotChartMap = React.createClass({
	selectedPlayer: null,
	getInitialState: function() {
		return {selectedPlayer: false};
	},
	handleFilterPlayerClick: function(e) {
		e.preventDefault();
		e.stopPropagation();
		$('#shot-map-player-filter').change(function() {
			var number = $('#shot-map-player-filter option:selected').val();
			if(number) {
				this.selectedPlayer = _.find(this.props.data, function(player) {
															return player.number === number;
														});
				this.setState({selectedPlayer: true});
			}
			else
				this.setState({selectedPlayer: false});
		}.bind(this));
	},
	render: function() {
		return (
			<div className="shot-chart-map">
				{this.state.selectedPlayer ?
					<ShotMarkerArray player={this.selectedPlayer} filtered={true} /> :
					this.props.data.map(function(player) {
						return (
							<ShotMarkerArray player={player} key={player.number} filtered={false} />
						);
					})
				}
				<select id="shot-map-player-filter"
								onClick={this.handleFilterPlayerClick}
								ref="playerFilter">
					<option value="" selected>All</option>
					{this.props.data.map(function(player, i) {
							return (
								<option value={player.number} key={i}>
									{"#" + player.number + " " + player.name}
								</option>
							);
					}.bind(this))}
				</select>
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
						<ShotMarker tooltip={this.props.filtered && !fg.assistedBy ? null :
																(this.props.filtered ? "" : "#" + this.props.player.number + " " + this.props.player.name) +
																	"\n" + (fg.assistedBy ? "(assist: #" + fg.assistedBy + ")" : "")}
							 										fg={fg}
							 										key={index}/>
					);
				}.bind(this))}
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
	},
	componentDidUpdate: function() {
		$(React.findDOMNode(this.refs.shot)).css({
			left: Number(this.props.fg.x) + 337,
			top: -(this.props.fg.y)
		});
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
		var tooltip = <Tooltip>{this.props.tooltip}</Tooltip>
		return (
			<OverlayTrigger placement="top" overlay={this.props.tooltip ? tooltip : <span></span>}>
				<div className={markerClass} ref="shot">
						<i className={faClass}></i>
				</div>
			</OverlayTrigger>
		);
	}
});

var ShotChartShooterModal = React.createClass({
	getInitialState: function() {
		return {shooterSelected: false};
	},
	componentDidMount: function() {
		$(".shot-chart-modal").css({
			left: this.props.modalX,
			top: this.props.modalY
		});
	},
	handleSelectShooter: function(e) {
		e.preventDefault();
		$('#shooter-options').change(function() {
			var number = $('#shooter-options option:selected').val();
			if(number)
				this.setState({shooterSelected: true});
			else
				this.setState({shooterSelected: false});
		}.bind(this));
	},
	handleMadeClick: function(e) {
		e.preventDefault();
		var shooter = this.refs.shooterSelect.getDOMNode().value;
		this.props.onShooterSubmit({player: shooter, made: true});
	},
	handleMissedClick: function(e) {
		e.preventDefault();
		var shooter = this.refs.shooterSelect.getDOMNode().value;
		this.props.onShooterSubmit({player: shooter, made: false});
	},
	cancelModal: function(e) {
		e.preventDefault();
		this.props.onCancelModal();
	},
	render: function() {
		return (
			<div>
				<div className="modal-bg modal-bg-clear" onClick={this.cancelModal}></div>
				<div className="shot-chart-modal">
					<span>Who took the shot?</span>
					<select id="shooter-options"
									onClick={this.handleSelectShooter}
									ref="shooterSelect">
						<option value="" disabled selected>Select player...</option>
						{this.props.data.map(function(player, i) {
								if(player.active === "true")
									return (
										<option value={player.number} key={i}>
											{"#" + player.number + " " + player.name}
										</option>
									);
						}.bind(this))}
					</select>
					<button className="btn btn-sm btn-success made-btn"
									disabled={!this.state.shooterSelected}
									onClick={this.handleMadeClick}>
						<i className="fa fa-fw fa-circle"></i> MADE
					</button>
					<button className="btn btn-sm btn-danger missed-btn"
									disabled={!this.state.shooterSelected}
									onClick={this.handleMissedClick}>
						<i className="fa fa-fw fa-times"></i> MISSED
					</button>
				</div>
			</div>
		);
	}
});

var ShotChartAssisterModal = React.createClass({
	getInitialState: function() {
		return {assisterSelected: false};
	},
	componentDidMount: function() {
		$(".shot-chart-modal").css({
			left: this.props.modalX,
			top: this.props.modalY
		});
	},
	handleSelectAssister: function(e) {
		e.preventDefault();
		$('#assister-options').change(function() {
			var number = $('#assister-options option:selected').val();
			if(number)
				this.setState({assisterSelected: true});
			else
				this.setState({assisterSelected: false});
		}.bind(this));
	},
	handleDoneClick: function(e) {
		e.preventDefault();
		var assister = this.refs.assisterSelect.getDOMNode().value;
		this.props.onAssisterSubmit({assister: assister});
	},
	handleNoAssistClick: function(e) {
		e.preventDefault();
		this.props.onAssisterSubmit({assister: null});
	},
	cancelModal: function(e) {
		e.preventDefault();
		this.props.onCancelModal();
	},
	render: function() {
		return (
			<div>
				<div className="modal-bg modal-bg-clear" onClick={this.cancelModal}></div>
				<div className="shot-chart-modal">
					<span>Who assisted?</span>
					<select id="assister-options"
									onClick={this.handleSelectAssister}
									ref="assisterSelect">
						<option value="" disabled selected>Select player...</option>
						{this.props.data.map(function(player, i) {
								if(player.active === "true" && player.number !== this.props.shooter)
									return (
										<option value={player.number} key={i}>
											{"#" + player.number + " " + player.name}
										</option>
									);
						}.bind(this))}
					</select>
					<button className="btn btn-sm btn-primary done-btn"
									disabled={!this.state.assisterSelected}
									onClick={this.handleDoneClick}>
						<i className="fa fa-fw fa-check"></i> DONE
					</button>
					<button className="btn btn-sm btn-default no-assist-btn" onClick={this.handleNoAssistClick}>
						<i className="fa fa-fw fa-times"></i> No Assist
					</button>
				</div>
			</div>
		);
	}
});

var NonShootingStatsInput = React.createClass({
	getInitialState: function() {
		return {statCommand: '', commandError: false};
	},
	recordStat: function(player, stat, index) {
		this.props.onRecordStat(player, stat);
		var button = $('.dropdown-toggle')[index+1]
		button.click();
		button.blur();
	},
	handleFocusInput: function() {
		this.setState({statCommand: ''}, function() {
			React.findDOMNode(this.refs.statCommandInput).focus();
		});
	},
	handleChangeCommand: function(e) {
		this.setState({statCommand: e.target.value});
	},
	handleCommandSubmit: function(e) {
		var _this = this;
		if(e.keyCode !== 13)
			return;
		var player = '';
		var stat = '';
		var made = null;
		var commandArray = this.state.statCommand.toLowerCase().split(" ");
		_.forEach(commandArray, function(str) {
			var nameToNumber = null;
			_.forEach(_this.props.data, function(p) {
				if(p.name.toLowerCase() === str || p.number === str || (str[0] === '#' && p.number === str.slice(1,str.length))) {
					player = p.number;
					return;
				}
			});
			if(str === 'made' || str === 'make' || str === 'yes' || str === 'y')
				made = true;
			else if(str === 'miss' || str === 'missed' || str === 'no' || str === 'n')
				made = false;
			else {
				switch(str) {
					case 'ft':
					case 'freethrow':
						stat = 'FT'
						break;
					case 'reb':
					case 'rebound':
						stat = 'REB'
						break;
					case 'stl':
					case 'steal':
						stat = 'STL'
						break;
					case 'blk':
					case 'block':
						stat = 'BLK'
						break;
					case 'to':
					case 'turnover':
						stat = 'TO'
						break;
					case 'pf':
					case 'foul':
						stat = 'Foul'
						break;
					default:
						break;
				}
			}
		});
		if(!player || !stat || (stat === 'FT' && made === null)) {
			this.setState({commandError: true});
			return;
		}
		else if(stat === 'FT') {
			this.props.onRecordCommandFT({number: player, made: made});
			this.setState({commandError: false});
		}
		else {
			this.props.onRecordStat(player, stat);
			this.setState({commandError: false});
		}
		this.handleFocusInput();
	},
	render: function() {
		var statsArray = ['REB', 'STL', 'BLK', 'TO', 'Foul'];
		var _this = this;
		return (
			<div className="non-shooting-stats-input">
				<div className="stats-title">NON-SHOOTING STATS</div>
				<ButtonToolbar>
					{statsArray.map(function(stat, statIndex) {
						return (
							<DropdownButton bsStyle="primary" title={stat} key={statIndex}>
								{_this.props.data.map(function(player, i) {
									if(player.active === "true")
										return (
											<MenuItem onClick={_this.recordStat.bind(_this,player.number,stat,statIndex)} eventKey={i} key={i}>
												{"#" + player.number + " " + player.name}
											</MenuItem>
										);
								})}
							</DropdownButton>
						);
					})}
				</ButtonToolbar>
				<input id="stat-command-input"
								value={this.state.statCommand}
								placeholder="Start typing..."
								onClick={this.handleFocusInput}
								onFocus={this.handleFocusInput}
								onChange={this.handleChangeCommand}
								onKeyDown={this.handleCommandSubmit}
								ref="statCommandInput" />
				{this.state.commandError ? <div className="error-message">Not a valid command</div> : null}
			</div>
		);
	}
});

var CurrentPlayers = React.createClass({
	activePlayers: [],
	getInitialState: function() {
		return {activeRoster: [], hover: null};
	},
	componentDidUpdate: function() {
		$('.current-player-btn').blur();
		if(this.activePlayers.length !== 5) {
			$('.current-player-btn').css({
				'border-color': '#d9534f',
				'color': '#d9534f'
			});
			$('.current-players-title').css('color', '#d9534f');
		}
		else {
			$('.current-player-btn').css({
				'border-color': '#ccc',
				'color': '#000'
			});
			$('.current-players-title').css('color', '#000');
		}
		if(this.state.hover !== null) {
			var selector = '#current-player-' + this.state.hover;
			$(selector).css({
				'border-color': '#eea236',
				'color': '#fff'
			});
		}
	},
	handleMouseEnter: function(index) {
		this.setState({hover: index});
	},
	handleMouseLeave: function() {
		this.setState({hover: null});
	},
	benchPlayer: function(player) {
		this.props.onSubPlayer(player);
	},
	render: function() {
		this.activePlayers = _.filter(this.props.data, function(player) {
			return player.active === "true";
		});
		return (
			<div className="current-players">
				<div className="current-players-title">CURRENT FIVE</div>
				<ButtonGroup className="player-list" ref="playerList">
					{!this.activePlayers.length ? <div>No players on the court.</div> : null}
					{this.activePlayers.map(function(player, index) {
						return (<Button className="current-player-btn"
														id={"current-player-" + index}
														bsStyle={this.state.hover === index ? "warning" : "default"}
														onMouseEnter={this.handleMouseEnter.bind(this,index)}
														onMouseLeave={this.handleMouseLeave}
														onClick={this.benchPlayer.bind(this,player.number)}
														key={index}>
											{this.state.hover === index ?
												<span><i className="fa fa-fw fa-user-times"></i> Bench</span>  : 
												"#" + player.number + " " + player.name}
										</Button>);
					}.bind(this))}
				</ButtonGroup>
			</div>
		);
	}
});

var BoxScore = React.createClass({
	previousRowStats: {},
	getInitialState: function() {
		return {displayTotals: false};
	},
	displayTotals: function() {
		this.setState({displayTotals: true});
	},
	updateTotals: function(rowStats, rowIndex) {
		if(!_.isEqual(rowStats,this.previousRowStats) && this.refs.boxScoreTotals) {
			this.previousRowStats = rowStats;
			this.refs.boxScoreTotals.update(rowStats, rowIndex);
		}
	},
	activatePlayer: function(player) {
		this.props.onSubPlayer(player);
	},
	render: function() {
		var _this = this;
		return (
			<div className="box-score">
				<div className="box-score-title">BOX SCORE</div>
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
						return <BoxScoreRow player={player}
																key={player.number}
																rowIndex={index}
																lastIndex={_this.props.data.length - 1}
																onRenderAllRows={_this.displayTotals}
																onBoxScoreRowUpdate={_this.updateTotals}
																onActivatePlayer={_this.activatePlayer} />
					})}
					{this.state.displayTotals ? <BoxScoreTotals data={this.props.data} ref="boxScoreTotals" /> : null}
				</table>
			</div>
		);
	}
});

var BoxScoreRow = React.createClass({
	rowStats: {},
	getInitialState: function() {
		return {hover: false};
	},
	componentWillMount: function() {
		this.rowStats = this.getPlayerBoxScoreStats(this.props.player);
	},
	componentDidMount: function() {
		if(this.props.rowIndex === this.props.lastIndex)
			this.props.onRenderAllRows();
		this.props.onBoxScoreRowUpdate(this.rowStats, this.props.rowIndex);
	},
	componentWillUpdate: function() {
		this.rowStats = this.getPlayerBoxScoreStats(this.props.player);
	},
	componentDidUpdate: function() {
		this.props.onBoxScoreRowUpdate(this.rowStats, this.props.rowIndex);
	},
	handleMouseEnter: function() {
		this.setState({hover: true});
	},
	handleMouseLeave: function() {
		this.setState({hover: false});
	},
	activatePlayer: function(player) {
		this.props.onActivatePlayer(player);
	},
	getPlayerBoxScoreStats: function(player) {
		var playerStats = {
			madeFG: 0,
			attemptedFG: 0,
			madeThrees: 0,
			attemptedThrees: 0,
			madeFT: 0,
			attemptedFT: 0,
			rebounds: 0,
			assists: 0,
			steals: 0,
			blocks: 0,
			turnovers: 0,
			fouls: 0,
			points: 0
		};
		_.forEach(player.attemptedFG, function(fg) {
			playerStats.attemptedFG++;
			if ((Math.pow(Number(fg.x), 2) + Math.pow(Number(fg.y), 2)) > 90000) {
				playerStats.attemptedThrees++;
				if(fg.made === "true") {
					playerStats.madeThrees++;
					playerStats.madeFG++;
				}
			}
			else {
				if(fg.made === "true")
					playerStats.madeFG++;
			}
		});
		_.forEach(player.attemptedFT, function(ft) {
			playerStats.attemptedFT++;
			if(ft.made === "true")
				playerStats.madeFT++;
		});
		_.forEach(player, function(n, key) {
			if(typeof(n) !== "object")
				playerStats[key] = n;
		});
		playerStats.points = (playerStats.madeFG - playerStats.madeThrees) * 2 + playerStats.madeThrees * 3 + playerStats.madeFT;
		return playerStats;
	},
	render: function() {
		return (
			<tr className="box-score-row">
				<td>{this.props.player.number}</td>
				<td onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
					{this.props.player.name}
					{this.state.hover && this.props.player.active !== "true" ?
						<Button className="activate-player-btn"
						bsStyle="success"
						bsSize="small"
						onClick={this.activatePlayer.bind(this,this.props.player.number)}>
						<i className="fa fa-fw fa-user-plus"></i> Play</Button> : null}</td>
				<td>{this.rowStats.madeFG}-{this.rowStats.attemptedFG}</td>
				<td>{this.rowStats.madeThrees}-{this.rowStats.attemptedThrees}</td>
				<td>{this.rowStats.madeFT}-{this.rowStats.attemptedFT}</td>
				<td>{this.rowStats.rebounds}</td>
				<td>{this.rowStats.assists}</td>
				<td>{this.rowStats.steals}</td>
				<td>{this.rowStats.blocks}</td>
				<td>{this.rowStats.turnovers}</td>
				<td>{this.rowStats.fouls}</td>
				<td>{this.rowStats.points}</td>
			</tr>
		);
	}
});

var BoxScoreTotals = React.createClass({
	totals : {
		madeFG: 0,
		attemptedFG: 0,
		madeThrees: 0,
		attemptedThrees: 0,
		madeFT: 0,
		attemptedFT: 0,
		rebounds: 0,
		assists: 0,
		steals: 0,
		blocks: 0,
		turnovers: 0,
		fouls: 0,
		points: 0
	},
	getInitialState: function() {
		return {totals: this.totals};
	},
	update: function(rowStats, rowIndex) {
		if(rowIndex === 0) {
			_.forEach(this.totals, function(n, key) {
				this.totals[key] = 0;
			}.bind(this));
		}
		_.forEach(rowStats, function(n, key) {
			this.totals[key] += Number(n);
		}.bind(this));
		this.setState({totals: this.totals});
	},
	getPercentage: function(makes, attempts) {
		if(attempts === 0)
			return '----';
		else
			return parseFloat(100 * makes/attempts).toFixed(1);
	},
	render: function() {
		return (
			<tr className="box-score-totals">
				<td></td>
				<td>TOTAL</td>
				<td>{this.totals.madeFG}-{this.totals.attemptedFG}<br/>
						({this.getPercentage(this.totals.madeFG, this.totals.attemptedFG)}%)</td>
				<td>{this.totals.madeThrees}-{this.totals.attemptedThrees}<br/>
						({this.getPercentage(this.totals.madeThrees, this.totals.attemptedThrees)}%)</td>
				<td>{this.totals.madeFT}-{this.totals.attemptedFT}<br/>
						({this.getPercentage(this.totals.madeFT, this.totals.attemptedFT)}%)</td>
				<td>{this.totals.rebounds}</td>
				<td>{this.totals.assists}</td>
				<td>{this.totals.steals}</td>
				<td>{this.totals.blocks}</td>
				<td>{this.totals.turnovers}</td>
				<td>{this.totals.fouls}</td>
				<td>{this.totals.points}</td>
			</tr>
		);
	}
});

React.render(
	<Main pollInterval={200} />,
	document.getElementById('stat-tracker')
);