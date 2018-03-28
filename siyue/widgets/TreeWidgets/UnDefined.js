import {registryTreeWidget} from '../_widgets';
// import {PropTypes} from 'react';
import PropTypes from 'prop-types';
const UnDefined = ({widget,props}) =>{
    return (<div className='db-table-cell-nowrap' style={{width:props.width,backgroup:'#f00'}}>Widget '{props.widget}' UnDefined</div>);
};
UnDefined .propTypes = {
    widget: PropTypes.string,
    props: PropTypes.object
}

registryTreeWidget(UnDefined);
export default UnDefined;
