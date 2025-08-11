// 测试驼峰命名转换功能的示例

function toCamelCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    .replace(/^[a-z]/, (letter) => letter.toUpperCase());
}

// 示例转换
const examples = [
  'user_profile',
  'like_count_view', 
  'order_detail',
  'product_category',
  'user_activity_log',
  'simple_view'
];

console.log('Snake_case to CamelCase conversion examples:');
examples.forEach(example => {
  const camelCase = toCamelCase(example);
  const entityName = `${camelCase}Entity`;
  console.log(`${example} -> ${camelCase} -> ${entityName}`);
});

/* 
Expected output:
user_profile -> UserProfile -> UserProfileEntity
like_count_view -> LikeCountView -> LikeCountViewEntity
order_detail -> OrderDetail -> OrderDetailEntity
product_category -> ProductCategory -> ProductCategoryEntity
user_activity_log -> UserActivityLog -> UserActivityLogEntity
simple_view -> SimpleView -> SimpleViewEntity
*/
