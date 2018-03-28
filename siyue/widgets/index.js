import createWidget from './_createWidget';
import {
    widgets, registryWidget,registryToolButton, getToolButton, registryToolGroup, getToolGroups,
    TreeWidgets,
    FormWidgets,
    KanbaWidgets,
    registryFormWidget,
    registryTreeWidget,
    registryKanbanWidget
} from './_widgets';
import DbInput from './DbInput';
import Field from './Field';
import SyMenu from './SyMenu';
import SyToolBar from './SyToolBar';
import ToolAction from './ToolAction';
import ToolButton from './ToolButton';
import ToolButtons from './ToolButtons';
import ToolGroup from './ToolGroup';
import AppContainer from './AppContainer';
import UserLogin from './UserLogin';
import AppRoot from './AppRoot';
import Tree from './Tree';
import Form from './Form';
import Contact from './Contact';
import Action from './Action';
import Notebook from './Notebook'
import Table from './Table'
import DbToDoList from './DbToDoList'

const Widgets = widgets

module.exports = {
    Action,
    createWidget,
    Widgets,
    widgets,
    registryWidget,
    registryToolButton,
    getToolButton,
    registryToolGroup,
    getToolGroups,
    DbInput,
    Field,
    SyMenu,
    SyToolBar,
    ToolAction,
    ToolButton,
    ToolButtons,
    ToolGroup,
    UserLogin,
    AppContainer,
    AppRoot,
    Tree,
    Form,
    Contact,
    Notebook,
    TreeWidgets,
    FormWidgets,
    KanbaWidgets,
    registryFormWidget,
    registryTreeWidget,
    registryKanbanWidget,
    Table,
    DbToDoList
}
