import { api } from '@/assets/js/common/api/ajax.js';

function handleDataTypes(options) {
  const outOptions = [
    { label: '常用类型', options: [] },
    { label: '扩展类型', options: [] },
  ];
  const firstOptions = options.slice(0, 3);
  const secondOptions = options.slice(3);
  outOptions[0].options = firstOptions;
  outOptions[1].options = secondOptions;
  return outOptions;
}
// 中文名校验
const tableCnNameValidator = (r, v, cb) => {
  const reg = /[;\'；‘’]/;
  if (reg.test(v)) {
    cb(new Error(r.message));
  } else {
    cb();
  }
};
// 英文名校验
const tableEnNameValidator = (r, v, cb) => {
  const reg = /^[_|a-z][0-9|a-zA-Z|_]*$/;
  if (v.match(reg)) {
    cb();
  } else {
    cb(new Error(r.message));
  }
};
async function columns(type) {
  let dataTypes = await api.get('/udmp-web/udmp/modelbuild/getHiveColumnTypes');
  dataTypes = handleDataTypes(dataTypes);
  // 注意事实表、维度表、应用表字段单词为错误单词 filed开头
  // 事实表 数据列
  const columnFact = [
    {
      type: 'index',
      title: '序号',
      minWidth: 45,
    },
    {
      title: '属性类型',
      key: 'attriType',
      type: 'Select',
      minWidth: 110,
      options: [
        { label: '事实', value: '0' },
        { label: '维度', value: '1' },
        { label: '度量', value: '2' },
      ],
    },
    {
      title: '中文名 <span style="color: red">*</span>',
      key: 'filedDesc',
      type: 'Input',
      minWidth: 140,
      validate: true,
      rules: [
        { required: true, message: '必填数据' },
        {
          validator: tableCnNameValidator,
          message: '格式错误',
        },
      ],
    },
    {
      title: '英文名 <span style="color: red">*</span>',
      key: 'filedName',
      type: 'Input',
      minWidth: 140,
      popup: true,
      validate: true,
      rules: [
        { required: true, message: '必填数据', trigger: 'change' },
        {
          validator: tableEnNameValidator,
          message: '格式错误',
          trigger: 'change',
        },
      ],
    },
    {
      title: '数据类型',
      key: 'filedType',
      type: 'SelectGroup',
      minWidth: 120,
      options: dataTypes,
    },
    {
      title: '长度',
      key: 'filedLength',
      type: 'Input',
      minWidth: 80,
      setDisable: true,
      disableKey: 'canUseLength',
    },
    {
      title: '精度',
      key: 'filedAccuracy',
      type: 'Input',
      minWidth: 80,
      setDisable: true,
      disableKey: 'canUseAccuracy',
    },
    {
      title: '备注',
      key: 'filedNotes',
      type: 'Input',
      minWidth: 100,
    },
    {
      title: '业务主键',
      key: 'isPrimaryKey',
      type: 'Checkbox',
      minWidth: 20,
    },
    {
      title: '敏感字段',
      key: 'isSensitive',
      type: 'Checkbox',
      minWidth: 20,
    },
  ];

  // 维度表 数据列
  const columnDim = [
    {
      type: 'index',
      title: '序号',
      minWidth: 40,
    },
    {
      title: '中文名 <span style="color: red">*</span>',
      key: 'filedDesc',
      type: 'Input',
      minWidth: 140,
      validate: true,
      rules: [
        { required: true, message: '必填数据' },
        {
          validator: tableCnNameValidator,
          message: '格式错误',
        },
      ],
    },
    {
      title: '英文名 <span style="color: red">*</span>',
      key: 'filedName',
      type: 'Input',
      minWidth: 140,
      popup: true,
      validate: true,
      rules: [
        { required: true, message: '必填数据', trigger: 'change' },
        {
          validator: tableEnNameValidator,
          message: '格式错误',
          trigger: 'change',
        },
      ],
    },
    {
      title: '数据类型',
      key: 'filedType',
      type: 'SelectGroup',
      minWidth: 120,
      options: dataTypes,
    },
    {
      title: '长度',
      key: 'filedLength',
      type: 'Input',
      minWidth: 80,
      setDisable: true,
      disableKey: 'canUseLength',
    },
    {
      title: '精度',
      key: 'filedAccuracy',
      type: 'Input',
      minWidth: 80,
      setDisable: true,
      disableKey: 'canUseAccuracy',
    },
    {
      title: '备注',
      key: 'filedNotes',
      type: 'Input',
      minWidth: 100,
    },
    {
      title: '业务主键',
      key: 'isPrimaryKey',
      type: 'Checkbox',
      minWidth: 55,
    },
    {
      title: '敏感字段',
      key: 'isSensitive',
      type: 'Checkbox',
      minWidth: 55,
    },
  ];

  // 应用表 数据列
  const columnApplication = [
    {
      type: 'index',
      title: '序号',
      minWidth: 40,
    },
    {
      title: '中文名 <span style="color: red">*</span>',
      key: 'filedDesc',
      type: 'Input',
      minWidth: 140,
      validate: true,
      rules: [
        { required: true, message: '必填数据' },
        {
          validator: tableCnNameValidator,
          message: '格式错误',
        },
      ],
    },
    {
      title: '英文名 <span style="color: red">*</span>',
      key: 'filedName',
      type: 'Input',
      minWidth: 150,
      popup: true,
      validate: true,
      rules: [
        { required: true, message: '必填数据', trigger: 'change' },
        {
          validator: tableEnNameValidator,
          message: '格式错误',
          trigger: 'change',
        },
      ],
    },
    {
      title: '数据类型',
      key: 'filedType',
      type: 'SelectGroup',
      minWidth: 120,
      options: dataTypes,
    },
    {
      title: '长度',
      key: 'filedLength',
      type: 'Input',
      minWidth: 80,
      setDisable: true,
      disableKey: 'canUseLength',
    },
    {
      title: '精度',
      key: 'filedAccuracy',
      type: 'Input',
      minWidth: 100,
      setDisable: true,
      disableKey: 'canUseAccuracy',
    },
    {
      title: '备注',
      key: 'filedNotes',
      type: 'Input',
      minWidth: 80,
    },
    {
      title: '业务主键',
      key: 'isPrimaryKey',
      type: 'Checkbox',
      minWidth: 55,
    },
    {
      title: '敏感字段',
      key: 'isSensitive',
      type: 'Checkbox',
      minWidth: 55,
    },
  ];

  // 业务过程
  const columnProcess = [
    {
      type: 'index',
      title: '序号',
      minWidth: 40,
    },
    {
      title: '中文名',
      key: 'fieldCnName',
      type: 'Input',
      minWidth: 100,
    },
    {
      title: '英文名',
      key: 'fieldEnName',
      type: 'Input',
      minWidth: 100,
      popup: true,
    },
    {
      title: '备注',
      key: 'fieldDesc',
      type: 'Input',
      minWidth: 120,
    },
  ];

  let columnArr = [];
  if (type === 'FACT') {
    columnArr = [...columnFact];
  } else if (type === 'DIMENSION') {
    columnArr = [...columnDim];
  } else if (type === 'APP') {
    columnArr = [...columnApplication];
  } else if (type === 'PROCESS') {
    columnArr = [...columnProcess];
  }
  columnArr.unshift({
    type: 'drag',
    title: '',
    minWidth: 40,
  });
  columnArr.push({
    title: '操作',
    type: 'action',
  });

  return columnArr;
}

export default columns;
