<template>
  <div>
    <div id="relation-container" class="mimi">
      <div class="no-tips" v-if="showNo">暂无血缘</div>
    </div>
    <transition enter-active-class="animate__animated animate__fadeInRight animate__faster">
      <PopUp v-model="showTip" :tipData="tipData" />
    </transition>
  </div>
</template>

<script>
import G6 from '@antv/g6';
import insertCss from 'insert-css';
insertCss(`
  .g6-component-tooltip {
    background-color: #303133;
    color:white;
    padding: 5px 10px 5px 10px;
  }
`);
export default {
  name: 'BloodRelation',
  data() {
    return {
      renderData: {},
      originEdges: [],
      graph: '',
      showTip: false,
      timer: null,
      tipData: {},
      showNo: false,
    };
  },
  created() {},
  props: ['retrievalType', 'database'],
  mounted() {
    let me = this;
    let { registerBehavior, registerEdge, registerNode } = G6;

    let itemHeight = 39;
    registerNode('dice-er-box', {
      draw(cfg, group) {
        let width = 190;
        let height = 248;
        let itemCount = 6;
        let boxStyle = {
          stroke: '#EAF6E8',
          radius: 4,
        };
        let { columns = [], startIndex = 0, selectedIndex } = cfg;
        // afterList 滚动后根据最新
        let afterList = columns.slice(Math.floor(startIndex), Math.floor(startIndex) + itemCount);

        let offsetY = (0.5 - (startIndex % 1)) * itemHeight + 20;

        let fontLeft = 12;

        // 外框矩形
        let keyshape = group.addShape('rect', {
          attrs: {
            x: 0,
            y: -30,
            width,
            height,
            stroke: '#C0CCDA',
            radius: 4,
            // 用于溢出tip
            name: 'main-box',
          },
          draggable: true,
          name: 'main-box',
        });
        // 绿色标题矩形
        group.addShape('rect', {
          attrs: {
            fill: boxStyle.stroke,
            height: 50,
            y: -30,
            width,
            radius: [boxStyle.radius, boxStyle.radius, 0, 0],
          },
          draggable: true,
          name: 'rect-title',
        });
        // 表名
        let handleName = cfg.name ? me.$utils.textOverflowPerfect(cfg.name, 170, 12) : cfg.name;
        group.addShape('text', {
          attrs: {
            y: -8,
            x: fontLeft,
            fill: '#606266',
            text: handleName,
            fullText: cfg.name,
            fontSize: 12,
            fontWeight: 600,
          },
          draggable: true,
          name: 'rect-title',
        });
        // 表介绍
        let handleComment = cfg.comment
          ? me.$utils.textOverflowPerfect(cfg.comment, 170, 12)
          : cfg.comment;
        group.addShape('text', {
          attrs: {
            y: 10,
            x: fontLeft,
            fill: '#888A8F',
            text: `${handleComment}`,
            fullText: cfg.comment,
            fontSize: 12,
          },
          draggable: true,
          name: 'rect-title',
        });

        // title下边的线
        group.addShape('rect', {
          attrs: {
            x: 0,
            y: 20,
            width,
            height: 0,
            stroke: '#C0CCDA',
          },
          draggable: true,
          name: 'title-bottom-line',
        });

        let listContainer = group.addGroup({});
        // 分组的裁剪会应用到所有的图形内
        listContainer.setClip({
          type: 'rect',
          attrs: {
            x: -3,
            y: 20,
            width: width + 16,
            height: 194,
          },
        });

        // afterlist虚拟列表截取的字段
        if (afterList) {
          afterList.forEach((e, i) => {
            let isSelected = Math.floor(startIndex) + i === Number(selectedIndex);
            let { type, name, id, cnName } = e;
            let handleEnName = name ? me.$utils.textOverflowPerfect(name, 60, 12) : name;
            let handleType = type ? me.$utils.textOverflowPerfect(type, 50, 12) : type;
            let handleCnName = cnName ? me.$utils.textOverflowPerfect(cnName, 58, 12) : cnName;
            // 字段两边的圆点
            if (!cfg.hideDot) {
              listContainer.addShape('circle', {
                attrs: {
                  x: 0,
                  y: i * itemHeight + offsetY,
                  r: 3,
                  stroke: '#C0CCDA',
                  fill: 'white',
                  lineWidth: 1,
                  cursor: 'pointer',
                },
                draggable: true,
                name: 'dot-left',
              });
              listContainer.addShape('circle', {
                attrs: {
                  x: width,
                  y: i * itemHeight + offsetY,
                  r: 3,
                  stroke: '#C0CCDA',
                  fill: 'white',
                  lineWidth: 1,
                  cursor: 'pointer',
                },
                draggable: true,
                name: 'dot-right',
              });
            }

            // 包含一行字段中文名 英文名 类型的矩形
            listContainer.addShape('rect', {
              attrs: {
                x: 0,
                y: i * itemHeight + offsetY - 18,
                width,
                height: 38,
                fill: 'white',
                opacity: 0,
                tableId: cfg.id,
                fieldId: e.id,
              },
              draggable: true,
              name: `item-${Math.floor(startIndex) + i}`,
            });
            // 真实的字段文本  分为三部分  colx+type+name
            // 字段英文名   【需要溢出处理】
            listContainer.addShape('text', {
              attrs: {
                x: 12,
                y: i * itemHeight + offsetY + 6,
                text: `${handleEnName}`,
                fullText: `${name}`,
                fontSize: 12,
                fill: '#606266',
                fontFamily:
                  'Avenir,-apple-system,BlinkMacSystemFont,Segoe UI,PingFang SC,Hiragino Sans GB,Microsoft YaHei,Helvetica Neue,Helvetica,Arial,sans-serif',
                full: e,
                fontWeight: isSelected ? 500 : 100,
                cursor: 'pointer',
                // 用于溢出tips
                name: `item-${Math.floor(startIndex) + i}-fen`,
                tableId: cfg.id,
                fieldId: e.id,
              },
              name: `item-${Math.floor(startIndex) + i}-fen`,
              draggable: true,
            });
            // 字段类型
            listContainer.addShape('text', {
              attrs: {
                x: 76,
                y: i * itemHeight + offsetY + 6,
                text: `${handleType}`,
                fullText: `${type}`,
                fontSize: 12,
                fill: '#606266',
                fontFamily:
                  'Avenir,-apple-system,BlinkMacSystemFont,Segoe UI,PingFang SC,Hiragino Sans GB,Microsoft YaHei,Helvetica Neue,Helvetica,Arial,sans-serif',
                full: e,
                fontWeight: isSelected ? 500 : 100,
                cursor: 'pointer',
                tableId: cfg.id,
                fieldId: e.id,
              },
              name: `item-${Math.floor(startIndex) + i}`,
              draggable: true,
            });
            // 字段中文名   【需要溢出处理】
            listContainer.addShape('text', {
              attrs: {
                x: 130,
                y: i * itemHeight + offsetY + 7,
                text: `${handleCnName}`,
                fullText: `${cnName}`,
                fontSize: 12,
                fill: '#606266',
                fontFamily:
                  'Avenir,-apple-system,BlinkMacSystemFont,Segoe UI,PingFang SC,Hiragino Sans GB,Microsoft YaHei,Helvetica Neue,Helvetica,Arial,sans-serif',
                full: e,
                fontWeight: isSelected ? 500 : 100,
                cursor: 'pointer',
                // 用于溢出tips
                name: `item-${Math.floor(startIndex) + i}-fcn`,
                tableId: cfg.id,
                fieldId: e.id,
              },
              name: `item-${Math.floor(startIndex) + i}-fcn`,
              draggable: true,
            });

            // 字段底线
            listContainer.addShape('rect', {
              attrs: {
                x: 0,
                y: i * itemHeight + offsetY + 19,
                width,
                height: 0,
                stroke: '#eee',
              },
              draggable: true,
              name: `item-${Math.floor(startIndex) + i}`,
            });
          });
        }

        return keyshape;
      },
      // 响应状态变化
      setState(name, value, item) {
        const group = item.getContainer();
        const rectTitle = group.get('children')[1]; // 顺序根据 draw 时确定
        const text1 = group.get('children')[2]; // 顺序根据 draw 时确定
        const text2 = group.get('children')[3]; // 顺序根据 draw 时确定
        const outline = item.getKeyShape(); // 顺序根据 draw 时确定
        if (name === 'selected') {
          if (value) {
            rectTitle.attr('fill', '#4099f7');
            outline.attr('stroke', '#4099f7');
            text1.attr('fill', '#fff');
            text2.attr('fill', '#fff');
          } else {
            rectTitle.attr('fill', '#EAF6E8');
            outline.attr('stroke', '#C0CCDA');
            text1.attr('fill', '#606266');
            text2.attr('fill', '#888A8F');
          }
        }
      },
    });
    registerEdge('dice-er-edge', {
      draw(cfg, group) {
        let sourceNode = cfg.sourceNode.getModel();
        let targetNode = cfg.targetNode.getModel();
        // sourceKey所在节点索引     sourceKey  targetKey用于创建字段连线
        let sourceIndex = sourceNode.columns.findIndex((item) => item.id === cfg.sourceKey);
        let sourceStartIndex = sourceNode.startIndex || 0;
        let sourceY = 25;
        if (sourceIndex > sourceStartIndex - 1) {
          sourceY = 50 + (sourceIndex - sourceStartIndex + 0.5) * 39;
          sourceY = Math.min(sourceY, 246);
        }

        let targetIndex = targetNode.columns.findIndex((e) => e.id === cfg.targetKey);
        let targetStartIndex = targetNode.startIndex || 0;
        let targetY = 25;
        if (targetIndex > targetStartIndex - 1) {
          targetY = 50 + (targetIndex - targetStartIndex + 0.5) * 39;
          targetY = Math.min(targetY, 246);
        }

        let startPoint = {
          ...cfg.startPoint, // startPoint 起点  endPoint终点 由锚点决定
        };
        let endPoint = {
          ...cfg.endPoint,
        };

        startPoint.y = startPoint.y + sourceY;
        endPoint.y = endPoint.y + targetY;

        let shape;

        if (cfg.hasOwnProperty('sourceKey')) {
          // 字段连线
          shape = group.addShape('path', {
            attrs: {
              stroke: '#4E85FF',
              path: [
                ['M', startPoint.x, startPoint.y],
                [
                  'C',
                  endPoint.x / 3 + (2 / 3) * startPoint.x,
                  startPoint.y,
                  endPoint.x / 3 + (2 / 3) * startPoint.x,
                  endPoint.y,
                  endPoint.x,
                  endPoint.y,
                ],
              ],
              endArrow: {
                path: G6.Arrow.triangle(11, 9, 3),
                d: 3,
                fill: '#4E85FF',
              },
            },
            name: 'path-shape',
          });
        } else {
          // 表连线
          shape = group.addShape('path', {
            attrs: {
              stroke: '#99A9BF',
              path: [
                ['M', startPoint.x, startPoint.y],
                ['L', endPoint.x / 3 + (2 / 3) * startPoint.x, startPoint.y], // 三分之一处
                ['L', endPoint.x / 3 + (2 / 3) * startPoint.x, endPoint.y], // 三分之二处
                ['L', endPoint.x, endPoint.y],
              ],
              lineDash: [3, 3],
              endArrow: {
                path: G6.Arrow.triangle(11, 9, 0),
                d: 0,
                fill: '#99A9BF',
                lineDash: [0, 0],
              },
            },
            name: 'path-shape',
          });
        }
        return shape;
      },
    });
    registerBehavior('dice-er-event', {
      getEvents() {
        return {
          wheel: 'handleWheel',
          'node:click': 'click',
          'node:dblclick': 'dblclick',
          'node:mousemove': 'mousemove',
        };
      },
      handleWheel(e) {
        e.preventDefault();
        let { graph } = this;
        let nodes = graph.getNodes().filter((n) => {
          let bbox = n.getBBox();
          return me.isInBBox(graph.getPointByClient(e.clientX, e.clientY), bbox);
        });

        if (nodes.length) {
          nodes.forEach((node) => {
            let model = node.getModel();
            if (model.columns.length < 6) {
              return;
            }
            let index = model.startIndex || 0;
            // e.deltaY 纵向滚动的距离 向下滚动是正值
            let startIndex = index + e.deltaY * 0.02;
            // 边界值处理
            if (startIndex < 0) {
              startIndex = 0;
            }

            if (startIndex > model.columns.length - 1) {
              startIndex = model.columns.length - 1;
            }
            graph.updateItem(node, {
              startIndex,
            });
          });
        } else {
          document.querySelector('.details-wrap').scrollBy(0, e.deltaY);
        }
      },
      click(e) {
        clearTimeout(me.timer);
        let { graph } = this;
        let curShape = e.target;

        let name = curShape.get('name');

        // 通过定时器处理双击带单击的问题
        me.timer = setTimeout(
          function (attrs) {
            if (name.startsWith('item')) {
              let { tableId, fieldId } = attrs;
              me.$api
                .post(`/jtlas-app-web/lineage/hive/column/guid`, {
                  depth: 1,
                  direction: 'BOTH',
                  guid: fieldId,
                  database: me.database,
                })
                .then(function (res) {
                  let { jtlasColumnNodes, processExecution, message } = res;

                  if (!jtlasColumnNodes.length) {
                    me.$message('没有字段关系！');
                    return;
                  }

                  let filedRelation = [];
                  jtlasColumnNodes.forEach((item) => {
                    if (item.direction === 'left') {
                      filedRelation.push({
                        source: item.tableId,
                        target: tableId,
                        sourceKey: item.columnId,
                        targetKey: fieldId,
                      });
                    } else {
                      filedRelation.push({
                        source: tableId,
                        target: item.tableId,
                        sourceKey: fieldId,
                        targetKey: item.columnId,
                      });
                    }
                  });
                  me.renderData.edges = me.originEdges.concat(filedRelation);
                  graph.read(me.renderData);
                  // 字段加工逻辑查看权限判断
                  if (message) {
                    me.$message(message);
                  }
                  // 出示字段详情
                  if (processExecution.length) {
                    me.showTip = true;
                    me.tipData = { processExecution, nodeType: 'ATTR' };
                  } else {
                    me.showTip = false;
                  }
                });
            } else if (name.startsWith('rect')) {
              let curItem = e.item;
              let curData = curItem.getModel();
              let otherNodes = me.graph
                .getNodes()
                .filter((item) => item.getModel().id !== curData.id);
              otherNodes.forEach((item) => me.graph.setItemState(item, 'selected', false));
              me.graph.setItemState(curItem, 'selected', true);
              let qualifiedName = e.item.getModel().qualifiedName;
              me.$api
                .get(`/jtlas-app-web/smart_atlas_offline/offline_detailsPageShow`, {
                  retrievalType: me.retrievalType,
                  id: qualifiedName,
                })
                .then(function (res) {
                  me.showTip = true;
                  me.tipData = { ...res, nodeType: 'TABLE' };
                });
            }
          },
          200,
          curShape.attrs
        );
      },
      dblclick(e) {
        clearTimeout(me.timer);
        if (e.target.get('name').startsWith('rect-title')) {
          let curNode = e.item.getModel();
          me.getAppendNodes(curNode);
        }
      },
      mousemove(e) {
        let name = e.target.get('name');
        let item = e.item;
        if (name && name.startsWith('item')) {
          this.graph.updateItem(item, {
            selectedIndex: Number(name.split('-')[1]),
            text: e.target.attrs.text,
            fullText: e.target.attrs.fullText,
          });
        } else {
          this.graph.updateItem(item, {
            selectedIndex: NaN,
            text: e.target.attrs.text,
            fullText: e.target.attrs.fullText,
          });
        }
      },
    });

    let container = document.getElementById('details-b-l');
    let width = container.scrollWidth;
    const toolbar = new G6.ToolBar({
      position: {
        x: width - 200,
        y: 0,
      },
    });
    const tooltip = new G6.Tooltip({
      offsetX: 10,
      offsetY: 10,
      // the types of items that allow the tooltip show up
      // 允许出现 tooltip 的 item 类型
      itemTypes: ['node'],
      // custom the tooltip's content
      // 自定义 tooltip 内容
      getContent: (e) => {
        let { fullText } = e.item.getModel();

        const outDiv = document.createElement('div');
        outDiv.innerHTML = `
      <h4>${fullText}</h4>`;
        return outDiv;
      },
      shouldBegin(e) {
        if (e.item.getModel().text && e.item.getModel().text.includes('...')) {
          return true;
        }
        return false;
      },
    });

    this.graph = new G6.Graph({
      container: 'relation-container',
      width,
      height: 700,
      defaultNode: {
        size: [300, 400],
        type: 'dice-er-box',
        anchorPoints: [
          [0, 0], // 左上角
          [1, 0], // 右上角
        ],
      },
      defaultEdge: {
        type: 'dice-er-edge',
      },
      modes: {
        default: ['dice-er-event', 'drag-node', 'drag-canvas'],
      },
      layout: {
        type: 'dagre',
        rankdir: 'LR', // 可选，默认为图的中心
        nodesep: -45, // 可选
        ranksep: 0, // 可选
        controlPoints: true, // 可选
      },
      fitCenter: true,
      plugins: [toolbar, tooltip], // 配置 ToolBar 插件
    });
    this.getInitNodes();
  },
  methods: {
    isInBBox(point, bbox) {
      let { x, y } = point;
      let { minX, minY, maxX, maxY } = bbox;

      return x < maxX && x > minX && y > minY && y < maxY;
    },
    async getInitNodes() {
      const res = await this.$api.post(`/jtlas-app-web/lineage/hive/table/attribute`, {
        depth: 1,
        direction: 'BOTH',
        qualifiedName: this.$route.query.id,
      });
      this.originEdges = res.edges;
      this.renderData = res;
      if (!res.nodes.length) {
        this.showNo = true;
      } else {
        this.graph.data(res);
        this.graph.render();
      }
    },
    async getAppendNodes(curNode) {
      if (curNode.qualifiedName === this.$route.query.id) {
        return;
      }
      const res = await this.$api.post(`/jtlas-app-web/lineage/hive/table/attribute`, {
        depth: 1,
        direction: curNode.direction === 'left' ? 'INPUT' : 'OUTPUT',
        qualifiedName: curNode.qualifiedName,
      });
      this.originEdges = this.originEdges.concat(res.edges);
      this.renderData = {
        nodes: [...this.renderData.nodes, ...res.nodes],
        edges: [...this.renderData.edges, ...res.edges],
      };
      this.graph.data(this.renderData);
      this.graph.render();
    },
  },
};
</script>

<style scoped>
::v-deep li[code='redo'] {
  display: none;
}
::v-deep li[code='undo'] {
  display: none;
}
#relation-container {
  position: relative;
}
.no-tips {
  position: absolute;
  left: 50%;
  top: 35%;
  transform: translate(-50%, -50%);
  color: #909399;
  font-size: 16px;
}
</style>
