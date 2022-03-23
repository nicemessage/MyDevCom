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
  name: 'LinkTrace',
  created() {
    this.curTable = this.$route.query.id;
    this.getInitNodes();
  },
  props: ['retrievalType'],
  data() {
    return {
      prevNode: '',
      showTip: false,
      timer: null,
      gData: {},
      graph: '',
      tipData: {},
      curTable: '',
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
        // 节点下边label
        group.addShape('text', {
          attrs: {
            text: cfg.nodeType === 'TABLE' ? cfg.tableName : cfg.name,
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
        rankdir: 'LR',
        ranksep: 77, // 可选
      },
      fitCenter: true,
      modes: {
        default: [
          'drag-node',
          'drag-canvas',
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

    this.graph.on('node:click', function (e) {
      clearTimeout(me.timer);
      me.timer = setTimeout(function () {
        let curItem = e.item;
        let curData = curItem.getModel();
        me.tipData = curData;
        me.showTip = true;
        let otherNodes = me.graph.getNodes().filter((item) => item.getModel().id !== curData.id);
        otherNodes.forEach((item) => me.graph.setItemState(item, 'selected', false));
        me.graph.setItemState(curItem, 'selected', true);
      }, 200);
    });
    this.graph.on('node:dblclick', function (e) {
      clearTimeout(me.timer);
      me.getFollowNodes(e);
    });
    this.graph.on('node:mouseenter', function (e) {
      let item = e.item;
      me.graph.setItemState(item, 'hover', true);
    });
    this.graph.on('node:mouseleave', function (e) {
      let item = e.item;
      me.graph.setItemState(item, 'hover', false);
    });
  },
  methods: {
    makeNodesEdges(res) {
      let originData = res[0];
      // left right可能有值可能没有值
      let lData = originData.left
        ? originData.left.map((item) => ({ ...item, direction: 'left' }))
        : [];
      let rData = originData.right
        ? originData.right.map((item) => ({ ...item, direction: 'right' }))
        : [];
      let nodes = [...lData, ...rData]
        .map((item) => ({ ...item, id: item.name, type: 'iconfont' }))
        .concat({ ...originData.tableBaseDTO, id: this.curTable });
      let edges = [];
      lData.forEach((item) => {
        edges.push({ source: item.name, target: this.curTable });
      });
      rData.forEach((item) => {
        edges.push({ target: item.name, source: this.curTable });
      });
      return {
        nodes,
        edges,
      };
    },
    async getInitNodes() {
      const res = await this.$api.post(
        `/jtlas-app-web/smart_atlas_offline/offline_linkTracingShow`,
        {
          id: this.curTable,
          direction: '',
          retrievalType: this.retrievalType,
          searchType: 'TABLE',
        }
      );
      let newData = this.makeNodesEdges(res);
      this.graph.data(newData);
      this.graph.render();
    },
    async getFollowNodes(e) {
      let itemCfg = e.item.getModel();
      let isTable = itemCfg.nodeType === 'TABLE';
      // 当前表双击没有行为
      if (itemCfg.id === this.curTable) {
        return;
      }
      let res;
      if (isTable) {
        // 双击表
        try {
          res = await this.$api.post(`/jtlas-app-web/smart_atlas_offline/offline_linkTracingShow`, {
            id: itemCfg.id,
            direction: itemCfg.direction,
            retrievalType: this.retrievalType,
            searchType: 'TABLE',
          });
          let tableData = res[0];
          tableData[itemCfg.direction].forEach((item) => {
            this.graph.addItem('node', {
              ...item,
              id: item.name,
              type: 'iconfont',
              direction: itemCfg.direction,
            });
            this.graph.addItem('edge', {
              source: itemCfg.direction === 'left' ? item.name : itemCfg.id,
              target: itemCfg.direction === 'left' ? itemCfg.id : item.name,
            });
            this.graph.layout();
          });
        } catch (err) {
          console.log(err);
        }
      } else {
        // 双击作业
        try {
          res = await this.$api.post(`/jtlas-app-web/smart_atlas_offline/offline_linkTracingShow`, {
            name: itemCfg.id,
            direction: itemCfg.direction,
            retrievalType: this.retrievalType,
            searchType: 'JOB',
          });
          res.forEach((item) => {
            this.graph.addItem('node', {
              ...item.tableBaseDTO,
              direction: itemCfg.direction,
            });
            this.graph.addItem('edge', {
              source: itemCfg.direction === 'left' ? item.tableBaseDTO.id : itemCfg.id,
              target: itemCfg.direction === 'left' ? itemCfg.id : item.tableBaseDTO.id,
            });
            this.graph.layout();
          });
        } catch (err) {
          console.log(err);
        }
      }
    },
    getTextByNodeType(type) {
      let text = '';
      switch (type) {
        case 'TABLE':
          text = '\ue72d';
          break;
        case 'JOB':
          text = '\ue61a';
          break;
      }
      return text;
    },
    getColorByNodeType(type) {
      let color = '';
      switch (type) {
        case 'TABLE':
          color = '#5b90dd';
          break;
        case 'JOB':
          color = '#f29d4b';
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
