import systate from './models/systate';
import router from './router';
wpimport.config = {'/':'/siyue/static/views'};
import Widgets from './widgets';
import midware from './midware';
import utils from './utils';
import createHistory from 'history/createBrowserHistory';


const SiYue = {Widgets:Widgets, widgets:Widgets, midware:midware, systate:systate, utils:utils, _globals:utils._globals};
window.SiYue = SiYue;  
// console.log(wpimport.config,'dva-app-wpimpoprt')
// 1. Initialize
const app = dvalib.dva({
    history: createHistory(),
    onError (error) { 
        console.error('app onError -- ', error);
    }

});

// 2. Plugins
// app.use({});

// 3. Model
app.model(systate);

// 4. Router
app.router(router); //require('./router'));

// 5. Start
app.start('#root');



