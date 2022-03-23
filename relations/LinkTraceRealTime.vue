<template>
  <div>
    <div id="link-container" class="mimi"></div>
    <transition enter-active-class="animate__animated animate__fadeInRight animate__faster">
      <PopUp v-model="showTip" :tipData="tipData" />
    </transition>
  </div>
</template>

<script>
import G6 from '@antv/g6';
export default {
  name: 'LinkTraceRealTime',
  created() {
    this.id = this.$route.query.id;
    this.getTopicNodes();
  },
  data() {
    return {
      showTip: false,
      tipData: {},
      id: '',
    };
  },
  mounted() {
    let me = this;
    G6.registerNode('iconfont', {
      draw(cfg, group) {
        group.addShape('text', {
          attrs: {
            text: '\ue649',
            x: 0,
            y: 10,
            fontSize: 60,
            textAlign: 'center',
            textBaseline: 'middle',
            fontFamily: 'iconfont',
            fill: me.getColorByNodeType(cfg.nodeType),
          },
          // must be assigned in G6 3.3 and later versions. it can be any value you want
          name: 'text-shape',
        });
        group.addShape('text', {
          attrs: {
            text: me.getTextByNodeType(cfg.nodeType),
            x: 0,
            y: 10,
            fontSize: 30,
            textAlign: 'center',
            textBaseline: 'middle',
            fontFamily: 'iconfont',
            fill: 'white',
          },
          // must be assigned in G6 3.3 and later versions. it can be any value you want
          name: 'text-shape',
        });
        // 底部的label
        group.addShape('text', {
          attrs: {
            text: cfg.label,
            x: 0,
            y: 50,
            fontSize: 12,
            textAlign: 'center',
            textBaseline: 'middle',
            fill: '#666',
          },
          // must be assigned in G6 3.3 and later versions. it can be any value you want
          name: 'text-shape',
        });
        group.addShape('circle', {
          attrs: {
            x: 0,
            y: 10,
            r: 30,
            lineWidth: 3,
            stroke: 'red',
            opacity: 0,
          },
          // must be assigned in G6 3.3 and later versions. it can be any value you want
          name: 'circle-shape',
        });
        let keyShape = group.addShape('text', {
          attrs: {
            text: '\ue649',
            x: 0,
            y: 10,
            fontSize: 60,
            textAlign: 'center',
            textBaseline: 'middle',
            fontFamily: 'iconfont',
            fill: me.getColorByNodeType(cfg.nodeType),
            opacity: 0,
          },
          // must be assigned in G6 3.3 and later versions. it can be any value you want
          name: 'text-shape',
        });
        return keyShape;
      },

      // 响应状态变化
      setState(name, value, item) {
        const group = item.getContainer();
        // 通过name的方式找图形
        const six = group.get('children')[0]; // 顺序根据 draw 时确定
        const icon = group.get('children')[1]; // 顺序根据 draw 时确定
        const text = group.get('children')[2]; // 顺序根据 draw 时确定
        const circle = group.get('children')[3]; // 顺序根据 draw 时确定

        if (name === 'hover') {
          if (value) {
            six.animate(
              {
                fontSize: 65,
              },
              {
                duration: 200,
              }
            );
            icon.animate(
              {
                fontSize: 35,
              },
              {
                duration: 200,
              }
            );
          } else {
            six.animate(
              {
                fontSize: 60,
              },
              {
                duration: 200,
              }
            );
            icon.animate(
              {
                fontSize: 30,
              },
              {
                duration: 200,
              }
            );
          }
        }
        if (name === 'inactive') {
          if (value) {
            six.attr('opacity', 0.1);
            icon.attr('opacity', 0.1);
            text.attr('opacity', 0.1);
          } else {
            six.attr('opacity', 1);
            icon.attr('opacity', 1);
            text.attr('opacity', 1);
          }
        }
        if (name === 'selected') {
          if (value) {
            circle.attr('opacity', 1);
          } else {
            circle.attr('opacity', 0);
          }
        }
      },

      getAnchorPoints() {
        return [
          [0, 0.5], // 左侧中间
          [1, 0.5], // 右侧中间
        ];
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
    this.graph = new G6.Graph({
      container: 'link-container',
      width,
      height: 700,
      layout: {
        type: 'dagre',
        align: 'DR', // 可选
        rankdir: 'LR',
      },
      fitCenter: true,
      modes: {
        default: [
          'drag-node',
          'drag-canvas',
          {
            type: 'click-select',
            shouldBegin: (e) => {
              if (e.item.getModel().nodeType === 'TYPE') {
                return false;
              }
              return true;
            },
          },
          {
            type: 'activate-relations',
            activeState: 'active',
            inactiveState: 'inactive',
          },
        ],
      },
      defaultNode: {
        type: 'iconfont',
        // label style nodeStateStyles等只适用于内置节点、边
      },
      defaultEdge: {
        type: 'quadratic',
        // 其他配置
        style: {
          endArrow: true,
          stroke: '#abbedd',
          lineWidth: 3,
        },
      },
      edgeStateStyles: {
        active: {
          stroke: '#abbedd',
          lineWidth: 3,
        },
        inactive: {
          opacity: 1,
        },
      },
      plugins: [toolbar], // 配置 ToolBar 插件
    });
    this.graph.on('node:mouseenter', function (e) {
      let item = e.item;
      me.graph.setItemState(item, 'hover', true);
    });
    this.graph.on('node:mouseleave', function (e) {
      let item = e.item;
      me.graph.setItemState(item, 'hover', false);
    });
    this.graph.on('nodeselectchange', (e) => {
      let curItem = e.target;
      if (curItem) {
        me.tipData = curItem.getModel();
        me.showTip = true;
      }
    });
  },
  methods: {
    makeNodesEdges(res) {
      let { tasksUseTopic, topicAlias, topicName, personInCharge, id } = res;
      let nodes = [];
      let edges = [];
      let headerNode = {
        topicAlias,
        topicName,
        personInCharge,
        id,
        nodeType: 'TOPIC',
        label: topicName,
      };
      nodes.push(headerNode);
      if (tasksUseTopic) {
        tasksUseTopic.forEach((item) => {
          nodes.push({
            id: `type${item.objectID}`,
            nodeType: 'TYPE',
            label: item.taskTypeAlias,
          });
          nodes.push({
            id: `name${item.objectID}`,
            nodeType: 'NAME',
            label: item.objectName,
            objectType: item.taskTypeAlias,
            objectId: item.objectID,
            objectName: item.objectName,
            objectDes: item.objectDescription,
            personInCharge: item.personInCharge,
          });
          edges.push({ source: id, target: `type${item.objectID}` });
          edges.push({ source: `type${item.objectID}`, target: `name${item.objectID}` });
        });
      }
      return {
        nodes,
        edges,
      };
    },
    async getTopicNodes() {
      const res = await this.$api.get(
        `/jtlas-app-web/smart_atlas_realtime/realtime_detailsPageShow`,
        {
          retrievalType: 'realTimeModel',
          id: this.id,
        }
      );
      let newData = this.makeNodesEdges(res);
      this.graph.data(newData);
      this.graph.render();
    },
    getTextByNodeType(type) {
      let text = '';
      switch (type) {
        case 'TOPIC':
          text = '\ue619';
          break;
        case 'TYPE':
          text = '\ue839';
          break;
        case 'NAME':
          text = '\ue64a';
          break;
      }
      return text;
    },
    getColorByNodeType(type) {
      let color = '';
      switch (type) {
        case 'TOPIC':
          color = '#f29d4b';
          break;
        case 'TYPE':
          color = '#60b89d';
          break;
        case 'NAME':
          color = '#5b90dd';
          break;
      }
      return color;
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
</style>
