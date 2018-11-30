import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {ListView, View, TouchableOpacity, Image, StyleSheet, Text} from 'react-native';
import {actions} from './const';
import RIcon from "./icomoonConf";

class Icon extends Component{
  static defaultProps = {
    icon:"",
    color:"#666",
    size:20
  };
  render(){
    let fontFamily = {fontFamily:"icomoon"};
    if(this.props.icon=="H1" || this.props.icon=="H2" || this.props.icon == "H3"){
      fontFamily = {};
    }
    return(
      <Text style = {[{fontSize:this.props.size,color:this.props.color},fontFamily]}>{this.props.icon}</Text>
    )
  }
}

const defaultActions = [
  // actions.insertImage,
  actions.setBold,
  actions.setItalic,
  actions.insertBulletsList,
  actions.insertOrderedList,
  actions.insertLink,
  actions.heading1,
  actions.heading2,
  actions.heading3,
  actions.setParagraph,
  actions.alignLeft,
  actions.alignCenter,
  actions.alignRight,
  actions.removeFormat
];

function getDefaultIcon() {
  const texts = {};
  texts[actions.insertImage] = RIcon("image");
  texts[actions.setBold] = RIcon("bold");
  texts[actions.setItalic] = RIcon("italics");
  texts[actions.insertBulletsList] = RIcon("list");
  texts[actions.insertOrderedList] = RIcon("orderList");
  texts[actions.insertLink] = RIcon("link");
  texts[actions.heading1] = "H1";
  texts[actions.heading2] = "H2";
  texts[actions.heading3] = "H3";
  texts[actions.setParagraph] = "正";
  texts[actions.alignLeft] = RIcon("left");
  texts[actions.alignCenter] = RIcon("center");
  texts[actions.alignRight] = RIcon("right");
  texts[actions.removeFormat] = RIcon("circleClear");
  return texts;
}


export default class RichTextToolbar extends Component {

  static propTypes = {
    getEditor: PropTypes.func.isRequired,
    actions: PropTypes.array,
    onPressAddLink: PropTypes.func,
    onPressAddImage: PropTypes.func,
    selectedButtonStyle: PropTypes.object,
    iconTint: PropTypes.any,
    selectedIconTint: PropTypes.any,
    unselectedButtonStyle: PropTypes.object,
    renderAction: PropTypes.func,
    iconMap: PropTypes.object,
  };

  constructor(props) {
    super(props);
    const actions = this.props.actions ? this.props.actions : defaultActions;
    this.state = {
      editor: undefined,
      selectedItems: [],
      actions,
      ds: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}).cloneWithRows(this.getRows(actions, []))
    };
  }

  // componentDidReceiveProps(newProps) {
    // const actions = newProps.actions ? newProps.actions : defaultActions;
    // this.setState({
    //   actions,
    //   ds: this.state.ds.cloneWithRows(this.getRows(actions, this.state.selectedItems))
    // });
  // }

  getRows(actions, selectedItems) {
    return actions.map((action) => {return {action, selected: selectedItems.includes(action)};});
  }

  componentDidMount() {
    const actions = this.props.actions ? this.props.actions : defaultActions;
    this.setState({
      actions,
      ds: this.state.ds.cloneWithRows(this.getRows(actions, this.state.selectedItems))
    });

    const editor = this.props.getEditor();
    if (!editor) {
      throw new Error('Toolbar has no editor!');
    } else {
      editor.registerToolbar((selectedItems) => this.setSelectedItems(selectedItems));
      this.setState({editor});
    }
  }

  setSelectedItems(selectedItems) {
    if (selectedItems !== this.state.selectedItems) {
      this.setState({
        selectedItems,
        ds: this.state.ds.cloneWithRows(this.getRows(this.state.actions, selectedItems))
      });
    }
  }

  _getButtonSelectedStyle() {
    return this.props.selectedButtonStyle ? this.props.selectedButtonStyle : styles.defaultSelectedButton;
  }

  _getButtonUnselectedStyle() {
    return this.props.unselectedButtonStyle ? this.props.unselectedButtonStyle : styles.defaultUnselectedButton;
  }

  _getButtonIcon(action) {
    if (this.props.iconMap && this.props.iconMap[action]) {
      return this.props.iconMap[action];
    } else if (getDefaultIcon()[action]){
      return getDefaultIcon()[action];
    } else {
      return undefined;
    }
  }

  _defaultRenderAction(action, selected) {
    const icon = this._getButtonIcon(action);
    return (
      <TouchableOpacity
          key={action}
          style={[
            {height: 50, width: 50, justifyContent: 'center',alignItems:"center"},
            selected ? this._getButtonSelectedStyle() : this._getButtonUnselectedStyle()
          ]}
          onPress={() => this._onPress(action)}
      >
        {icon ? <Icon icon = {icon} color = {selected ? "#333" : "#666"}/> : null}
      </TouchableOpacity>
    );
  }

  _renderAction(action, selected) {
    return this.props.renderAction ?
        this.props.renderAction(action, selected) :
        this._defaultRenderAction(action, selected);
  }

  render() {
    return (
      <View
          style={[{height: 50, backgroundColor: '#D3D3D3', alignItems: 'center'}, this.props.style]}
      >
        <ListView
            horizontal
            contentContainerStyle={{flexDirection: 'row'}}
            dataSource={this.state.ds}
            removeClippedSubviews={false}
            renderRow= {(row) => this._renderAction(row.action, row.selected)}
        />
      </View>
    );
  }

  _onPress(action) {
    switch(action) {
      case actions.setBold:
      case actions.setItalic:
      case actions.insertBulletsList:
      case actions.insertOrderedList:
      case actions.setUnderline:
      case actions.heading1:
      case actions.heading2:
      case actions.heading3:
      case actions.heading4:
      case actions.heading5:
      case actions.heading6:
      case actions.setParagraph:
      case actions.removeFormat:
      case actions.alignLeft:
      case actions.alignCenter:
      case actions.alignRight:
      case actions.alignFull:
      case actions.setSubscript:
      case actions.setSuperscript:
      case actions.setStrikethrough:
      case actions.setHR:
      case actions.setIndent:
      case actions.setOutdent:
        this.state.editor._sendAction(action);
        break;
      case actions.insertLink:
        this.state.editor.prepareInsert();
        if(this.props.onPressAddLink) {
          this.props.onPressAddLink();
        } else {
          this.state.editor.getSelectedText().then(selectedText => {
            this.state.editor.showLinkDialog(selectedText);
          });
        }
        break;
      case actions.insertImage:
        this.state.editor.prepareInsert();
        if(this.props.onPressAddImage) {
          this.props.onPressAddImage();
        }
        break;
        break;
    }
  }
}

const styles = StyleSheet.create({
  defaultSelectedButton: {
    // backgroundColor: 'red'
  },
  defaultUnselectedButton: {}
});