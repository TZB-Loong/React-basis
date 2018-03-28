import {registryMarkdownWidget} from '../utils/markdown';
import { PropTypes, createElement, Component } from 'react';
import {NoWrap} from './_widgets';
import {isfalse} from '../utils';

class SyVideo extends Component {
    constructor (props){
        super(props)
    }

    render() {
        return <video className={this.props.className} src={this.props.src} poster={this.props.poster} height={this.props.height} width={this.props.width} ref={(e)=>{
            if (e!=null){
                e.autoplay = this.props.autoplay==true;
                e.controls = this.props.controls!=false;
                e.muted = this.props.muted==true;
                e.loop = this.props.loop==true;
            }
        }} />
    }
}

registryMarkdownWidget(SyVideo, 'SyVideo');
export default SyVideo;
