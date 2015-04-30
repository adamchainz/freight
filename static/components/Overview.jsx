/** @jsx React.DOM */

var React = require('react');

var api = require('../api');

var BarChart = require("./BarChart");
var PollingMixin = require('../mixins/polling');
var TaskSummary = require('./TaskSummary');

var Overview = React.createClass({
  mixins: [PollingMixin],

  getInitialState() {
    return {
      loading: true,
      tasks: [],
      dailyStatsLoading: true,
      dailyStats: []
    };
  },

  componentWillMount() {
    api.request(this.getPollingUrl(), {
      success: (data) => {
        this.setState({
          loading: false,
          tasks: data
        });
      }
    });

    api.request('/stats/', {
      success: (data) => {
        this.setState({
          dailyStats: data,
          dailyStatsLoading: false
        });
      }
    });
  },

  getPollingUrl() {
    return '/tasks/';
  },

  pollingReceiveData(data) {
    this.setState({
      tasks: data
    });
  },

  taskInProgress(task) {
    return task.status == 'in_progress' || task.status == 'pending';
  },

  render() {
    if (this.state.loading) {
      return <div className="loading" />;
    }

    var activeTaskNodes = this.state.tasks.filter((task) => {
      return this.taskInProgress(task);
    }).map((task) => {
      return (
        <TaskSummary key={task.id} task={task} />
      );
    });

    var previousTaskNodes = this.state.tasks.filter((task) => {
      return !this.taskInProgress(task);
    }).map((task) => {
      return (
        <TaskSummary key={task.id} task={task} />
      );
    });

    points = this.state.dailyStats.map((point) => {
      return {x: point[0], y: point[1]};
    });

    return (
      <div>
        <div className="section">
          <div className="section-header">
            <h2>Active Deploys</h2>
          </div>
          {activeTaskNodes.length ?
            <ul className="task-list">
              {activeTaskNodes}
            </ul>
          :
            <p>There are no active tasks.</p>
          }
        </div>

        <div className="section">
          <div className="section-header">
            <h2>Deploy History</h2>
          </div>

          <div className="section">
            <BarChart points={points} label="deploys" />
          </div>

          {previousTaskNodes.length ?
            <ul className="task-list">
              {previousTaskNodes}
            </ul>
          :
            <p>There are no historical tasks.</p>
          }
        </div>
      </div>
    );
  }
});

module.exports = Overview;
