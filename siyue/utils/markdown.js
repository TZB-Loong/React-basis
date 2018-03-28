import {createRegistry, isfalse} from './_utils';

const MarkDownWidgets = createRegistry();
const registryMarkdownWidget = MarkDownWidgets.registry;

const mention_tag = (text)=>{
    /*将文本内容转为react组件定义对象{tag: tag, props: props, children: children, length:length}
       length为tag文本长度

       联系人markdown定义,@[mention](python object string)

       python object string格式[id, 名称],可能通过eval转为python list或tuple对象
     */
    var mn = text.match(mention_tag.pattern), mns={}, tlen;
    if (mn.length>0){
        tlen = mn[0].length;
        mn = mn[0].match(/\([\d\D]*?\)/);
        if (mn.length>0){
            mns = {props:{value: py.eval(mn[0])}, tag:'SyMention', children:[], length:tlen};
        }
    }
    return mns;
}
mention_tag.pattern=/@\[mention\]\([\d\D]*?\)/;
mention_tag.to_markdown = (tag)=>{
    let [id, name] = tag[1].value;
    let ms = `@[mention](${id}, "${name}")`;
    return ms;
}

const br_tag = (text)=>{
    var mn = text.match(br_tag.pattern), mns={}, tlen;
    if(mn.length>0){
        tlen = mn[0].length;
        mns = {tag:'br', length:mn[0].length};
    }
    return mns;
}
br_tag.pattern = / {2,}\n/g;
br_tag.to_markdown = (tag)=>{
    /*将tag定义转为markdown文本
     */
    return '  \n';
}

const image_tag = (text)=>{
    /*将文本转为react定义对象
       markdown 图片定义!["alt text" id](url/src "title")
       id为附档表中相应资源记录的id
       alt作为文件名称
     */
    var tgsrc = text.match(image_tag.pattern), tlen, altsrc, alttxt, imgtxt, imgtitle, i, tg={}, imgid;
    if (tgsrc.length>0){
        tgsrc = tgsrc[0]
        tlen = tgsrc.length;
        altsrc = tgsrc.match(/\[[\d\D]*?\]/);
        altsrc = altsrc.length>0? altsrc[0]: '[]';
        altsrc = altsrc.substr(1,altsrc.length-2).trim();
        alttxt = altsrc.match(/\"[\d\D]*?\"/);
        if (altsrc.length>0){
            if (alttxt.length>0){
                alttxt = alttxt.length>0?alttxt[0].substr(1, alttxt[0].length-2): '';
                imgid = altsrc.substr(alttxt.length+2, altsrc.length).trim();
            } else {
                alttxt = '';
                imgid = altsrc;
            }
        } else {
            alttxt = '';
            imgid = '';
        }
        imgtxt = tgsrc.match(/\([\d\D]*?\)/);
        imgtxt = imgtxt.length>0? imgtxt[0]: '';
        imgtitle = imgtxt.match(/\"[\d\D]*?\"/);
        imgtitle = imgtitle.length>0? imgtitle[0]: '\"\"';
        imgtitle = imgtitle.substr(1,imgtitle.length-2);
        i = imgtxt.search(/\s/);
        imgtxt = imgtxt.substr(1,i-1);
        tg = {tag:'img', length:tlen, props:{src:imgtxt, title:imgtitle, alt: alttxt, id:imgid}};
    }
    return tg;
}
image_tag.pattern = /!\[[\d\D]*?\]\([\d\D]*?\)/;
image_tag.to_markdown = (tag)=>{
    let {src, alt, title, id} = tag[1];
    alt = isfalse(alt)? '': alt;
    title = isfalse(title)? '': title;
    id = isfalse(id)? '': id;
    let ms = `!["${alt}" ${id}](${src} "${title}")`;
    return ms;
}

const video_tag = (text)=>{
    /*将文本转为react定义对象
       markdown 视频定义@[video id](src options)
       options定义为每个选项使用"名称=值"表示,选项用空格分开
       id为附件表中相应资源记录的id
     */
    var tgsrc = text.match(video_tag.pattern), tlen, cnts, tg={}, op, ids, props={} ;
    if (tgsrc.length>0){
        tgsrc = tgsrc[0];
        tlen = tgsrc.length;
        ids = tgsrc.match(/\[[\d\D]*?\]/);
        ids = ids[0].substr(1, ids[0].length-2).trim().split(' ');
        props.id = ids[1].trim();
        cnts = tgsrc.match(/\([\d\D]*?\)/);
        if (cnts.length>0){
            cnts = cnts[0];
            cnts = cnts.substr(1,cnts.length-2);//.split(" ");
            props.src = cnts.substr(0, cnts.indexOf(' '));
            var opts = cnts.match(/\"[\d\D]*?\"/g);
            opts.map(n=>{
                n = n.substr(1, n.length-2).split('=');
                props[n[0]] = n[1];
            });
            tg = {tag: 'SyVideo', length: tlen, props: props}
        }
    }
    return tg;
}
video_tag.pattern=/@\[video[\d\D]*?\]\([\d\D]*?\)/;
video_tag.to_markdown = (tag)=>{
    let src = tag[1].src;
    let id = tag[1].id;
    let opts = [];
    id = isfalse(id)? '': id;
    src = isfalse(src)? '': src;
    Object.keys(tag[1]).map(k=>{
        if ('width,height,controls,autoplay,muted,loop,alt'.split(',').indexOf(k)!=-1){
            opts.push(k+'='+tag[1][k]);
        }
    });
    opts = opts.join('" "');
    let ms = `@[video ${id}](${src} "${opts}")`;
    return ms;
}

const todo_tag = (text)=>{
    /*待办事项标签定义
       @[todo 修改标识*号id]("状态" "待办事项" "开始日期" "结束日期" "主办人id,主办人名字" "关联人id,关联人名字" )

       修改标识符为*号,带*号时表示内容已修改,需要更新到后台
       id为todo对象在相应数据表中的记录id,没有指定时默认记录为新建
       id为NEW开头时表示新建的对象

     */
    let tdsrc = text.match(todo_tag.pattern), tg, tlen, itms, atds, ids;
    if (tdsrc.length<=0) return
    tdsrc = tdsrc[0];
    ids = tdsrc.match(/\[[\d\D]*?\]/g);
    ids = ids[0].substr(1, ids[0].length-2).trim().split(' ');
    ids = ids.length>=2? ids[1]: '';
    ids = ids.trim();
    tlen = tdsrc.length;
    itms = tdsrc.match(/\"[\d\D]*?\"/g);
    itms = itms.map(itm=>{
        return itm.substr(1, itm.length-2);
    });
    atds = itms.slice(5,itms.length).map(atd=>{
        return atd.split(',');
    })
    tg = {
        tag: 'SyTodoItem',
        length: tlen,
        props: {
            id: ids,
            value:{
                state: itms[0]=='true',
                name: itms[1],
                start_datetime: itms[2],
                end_datetime: itms[3],
                attendee_ids: atds,
            }}
    }
    if(itms.length>4){
        tg.props.value.handler_id = itms[4].split(',');
    }
    return tg;
}
todo_tag.pattern = /@\[todo[\d\D]*?\]\([\d\D]*?\)/;
todo_tag.to_markdown = (tag)=>{
    let state = tag[1].value.state||false;
    let name = tag[1].value.name||'';
    let start_datetime = tag[1].value.start_datetime||'';
    let end_datetime = tag[1].value.end_datetime||'';
    let hid = tag[1].value.handler_id||[];
    let aids = tag[1].value.attendee_ids||[];
    let ids = [hid, ...aids];
    ids = ids.map(rid=>{
        return isfalse(rid)? '': `"${rid[0]},${rid[1]}"`;
    });
    ids = isfalse(ids)? '': ids.join(' ');
    let rid = tag[1].id;
    rid = isfalse(rid)? '': rid;
    let ms = `@[todo ${rid}]("${state}" "${name}" "${start_datetime}" "${end_datetime}" ${ids})`;
    return ms;
}

const tags = [mention_tag, br_tag, image_tag, video_tag, todo_tag];

const parse_tag = (text)=>{
    /*将类markdown文本转为react格式数组
       . 提取联系人内容,联系人语法@[mention](id,名称)
       返回tag列表,tag定义

       [tag_obj, tag_props, tag_children]

       |---|---|---|---|---|
       |名称|类型|说明|默认值|是否必须|
       |tag_obj|func/string|react组件方法或html标签|无|是|
       |tag_props|object|创建组件时使用的属性|{}|否|
       |tag_children|array|子组件|[]|否|

     */
    var ctag, pos, minpos, ptags=[], txt, rtag, ctag;
    while (text.length>0){
        minpos=text.length;
        ctag = false;
        for(var i=0;i<tags.length;i++){
            pos = text.search(tags[i].pattern);
            if (pos==0){
                ctag = tags[i];
                minpos = pos;
                break;
            } else if (pos<minpos && pos>-1) {
                minpos = pos;
                ctag = tags[i];
            }
            
        }
        if (minpos==0){
            rtag = ctag(text);
            ptags.push([rtag.tag, rtag.props,rtag.children]);
            text = text.slice(rtag.length);
        } else {
            ptags.push(['SySpan', {}, text.substr(0, minpos)]);
            text = text.substr(minpos);
        }
    }
    return ptags;
}

const renderTag = (tagDefine, propsMap)=>{
    /*将tag定义渲染为节点

       参数

       |---|---|---|---|---|
       |名称|类型|说明|默认值|是否必须|
       |tagDefine|array|tag定义, 由parse_tag方法解析返回|无|是|
       |propsMap|object|tag中标签对应react组件创建时使用的属性内容对应字典|无|是|

       propsMap对象格式为tag名称对应的props对象
       {tag_name: props}

     */
    var tgobj = MarkDownWidgets[tagDefine[0]], tg, props, children;
    propsMap = isfalse(propsMap)? {}: propsMap;
    props = propsMap[tagDefine[0]];
    props = isfalse(props)? {}: props;
    Object.assign(props, tagDefine[1]);
    if(typeof tgobj=='function'){
        tg = tgobj;
    } else if (typeof tgobj=='object'){
        tg = tgobj.entry;
        Object.assign(props, tgobj.props);
    } else {
        tg = tagDefine[0];
    }
    if (tagDefine.length<3 || isfalse(tagDefine[2])){
        return React.createElement(tg, props);
    } else {
        var tgs = typeof tagDefine[2].map=='function'? tagDefine[2].map(ctg=>{return renderTag(ctg)}) : tagDefine[2];
        return React.createElement(tg, props, tgs);
    }
}

const renderMarkdown = (text, propsMap={})=>{
    /*将markdown文本转为react组件并渲染成dom节点

       |---|---|---|---|---|
       |名称|类型|说明|默认值|是否必须|
       |text|string| markdown文本|无|是|
       |propsMap|object|将必要的参数传递给组件|无|否|

     */
    var pts = parse_tag(text);
    return pts.map(tag=>{
        return renderTag(tag, propsMap);
    });
}


module.exports = {
    parse_tag,
    renderTag,
    br_tag, image_tag, mention_tag, video_tag, todo_tag,
    renderMarkdown,
    registryMarkdownWidget,
    MarkDownWidgets,
}
