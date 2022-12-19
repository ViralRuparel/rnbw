import './SettingsPanel.css';

import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  useDispatch,
  useSelector,
} from 'react-redux';

import {
  serializeFile,
  updateNode,
} from '@_node/apis';
import { TTree } from '@_node/types';
import * as Main from '@_redux/main';
import { MainContext } from '@_redux/main';
import { useEditor } from '@craftjs/core';

import { SettingsPanelProps } from './types';

type StyleProperty = {
  name: string,
  value: string,
}

export default function SettingsPanel(props: SettingsPanelProps) {
  const dispatch = useDispatch()

  // for groupping action - it contains the actionNames as keys which should be in the same group
  const runningActions = useRef<{ [actionName: string]: boolean }>({})
  const noRunningAction = () => {
    return Object.keys(runningActions.current).length === 0 ? true : false
  }
  const addRunningAction = (actionNames: string[]) => {
    for (const actionName of actionNames) {
      runningActions.current[actionName] = true
    }
  }
  const removeRunningAction = (actionNames: string[], effect: boolean = true) => {
    for (const actionName of actionNames) {
      delete runningActions.current[actionName]
    }
    if (effect && noRunningAction()) {
      dispatch(Main.increaseActionGroupIndex())
    }
  }

  // get the current selected node
  const { selected } = useEditor((state, query) => {
    const currentNodeId = query.getEvent('selected').last()
    let selected
    if (currentNodeId !== undefined && currentNodeId !== 'ROOT') {
      selected = {
        id: currentNodeId,
        name: state.nodes[currentNodeId].data.name,
        style: state.nodes[currentNodeId].data.props.style,
        props: state.nodes[currentNodeId].data.props,
        isDeletable: query.node(currentNodeId).isDeletable(),
      }
    }
    return { selected }
  })

  const [styleLists, setStyleLists] = useState<Record<string, StyleProperty>>({})

  // context
  const { nodeTree, setNodeTree, validNodeTree, setValidNodeTree } = useContext(MainContext)
  const { workspace, openedFiles, currentFile: { type }, pending, messages } = useSelector(Main.globalSelector)

  useEffect(() => {
    let elements: Record<string, StyleProperty> = {}

    // show default styles like margin, padding, etc...
    const defaultStyles = ["margin", "padding"]
    defaultStyles.map((name) => {
      elements[name] = {
        name,
        value: "",
      }
    })

    if (selected !== undefined && selected.style !== undefined) {
      Object.keys(selected.style).map((name) => {
        elements[name] = {
          name: name,
          value: selected.style[name],
        }
      })
    }
    setStyleLists(elements)
  }, [selected])

  /**
   * It's for saving styles
   * @param styleList 
   * @returns Object { name : value }
   */
  const convertStyle = (styleList: Record<string, StyleProperty>) => {
    const result: { [styleName: string]: string } = {}
    Object.keys(styleList).map((key) => {
      const styleItem = styleList[key]
      result[styleItem.name] = styleItem.value
    })
    return result
  }

  // update the file content
  const updateFFContent = useCallback(async (tree: TTree) => {
    const newContent = serializeFile({ type, tree })
    dispatch(Main.updateFileContent(newContent))
  }, [type])

  return <>
    <div className="panel">
      <div className="border-bottom" style={{ height: "100px", overflow: "auto" }}>
        {/* Nav Bar */}
        <div className="sticky direction-column padding-s box-l justify-stretch border-bottom background-primary">
          <div className="gap-s box justify-start">
            {/* label */}
            <span className="text-s">Settings</span>
          </div>
          <div className="gap-s justify-end box">
            {/* action button */}
            <div className="icon-add opacity-m icon-xs" onClick={() => { }}></div>
          </div>
        </div>

        {/* panel body */}
        <div className="direction-row">
          {selected !== undefined && Object.keys(styleLists).map((key) => {
            const styleItem = styleLists[key]
            return <div key={'attr_' + styleItem.name}>
              <label className='text-s'>{styleItem.name}:</label>
              <input
                className='text-s opacity-m'
                type="text"
                value={styleItem.value}
                onChange={(e) => {
                  // display chages of style properties
                  const newStyleList = JSON.parse(JSON.stringify(styleLists))
                  newStyleList[key].value = e.target.value
                  setStyleLists(newStyleList)

                  // props changed
                  addRunningAction(['updateNode'])
                  const tree = JSON.parse(JSON.stringify(nodeTree))
                  updateNode({
                    tree: tree,
                    data: {
                      ...selected.props,
                      style: convertStyle(newStyleList),
                    },
                    uid: selected.id
                  })
                  updateFFContent(tree)
                  removeRunningAction(['updateNode'])
                }}
              />
            </div>
          })}
        </div>
      </div>
    </div>
  </>
}