// import { PropTypes } from 'react';
import PropTypes from 'prop-types';
import Launcher from './Launcher';
var {Router,Route} = dvalib;

const Routers = function ({ history, app }) {
    const routes = [
        {
            path: '/siyue',
            component: Launcher,
            childRoutes: [],
        },
    ]
    // return <Router history={history} routes={routes} />
    return <Router history={history}>
        <Route exact path='/siyue' component={Launcher} childRoutes={[]}/>
    </Router>
}

Routers.propTypes = {
  history: PropTypes.object,
  app: PropTypes.object,
}

export default Routers; //RouterConfig; //
