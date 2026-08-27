export const assets = [
  {symbol:'AAPL',name:'Apple',sector:'Technology',price:228.87,change:1.84,weight:32.4,lat:37.7749,lng:-122.4194,color:'#60a5fa'},
  {symbol:'NVDA',name:'NVIDIA',sector:'Semiconductors',price:182.44,change:-0.72,weight:21.4,lat:37.7849,lng:-122.4094,color:'#a3e635'},
  {symbol:'GOOG',name:'Alphabet',sector:'Technology',price:202.13,change:0.91,weight:15.9,lat:37.7649,lng:-122.4294,color:'#fbbf24'},
  {symbol:'MSFT',name:'Microsoft',sector:'Technology',price:506.72,change:0.33,weight:9.8,lat:37.7840,lng:-122.4310,color:'#38bdf8'},
  {symbol:'TSLA',name:'Tesla',sector:'Automotive',price:346.17,change:-1.12,weight:7.1,lat:37.7680,lng:-122.4050,color:'#fb7185'},
  {symbol:'AMZN',name:'Amazon',sector:'Consumer',price:231.48,change:1.27,weight:6.4,lat:37.7920,lng:-122.4200,color:'#fb923c'},
  {symbol:'USDG',name:'USDG',sector:'Stablecoin',price:1,change:0.01,weight:7.0,lat:37.7580,lng:-122.4140,color:'#34d399'}
];
export const actions = [
 {symbol:'AAPL',type:'PRICE',text:'AAPL quote refreshed',time:'2m ago',tone:'up'},
 {symbol:'NVDA',type:'PRICE',text:'NVDA quote moved -0.72%',time:'7m ago',tone:'down'},
 {symbol:'GOOG',type:'DATA',text:'GOOG metadata verified',time:'12m ago',tone:'neutral'},
 {symbol:'USDG',type:'STATUS',text:'USDG status active',time:'18m ago',tone:'up'}
];
export const agents = [
 {name:'Atlas Guard',desc:'Concentration and exposure monitor',runs:'12.4K',rating:'4.9',color:'emerald'},
 {name:'Corporate Watch',desc:'Surfaces splits, dividends and multiplier changes',runs:'8.2K',rating:'4.8',color:'blue'},
 {name:'RWA Scanner',desc:'Ranks assets by data quality and market movement',runs:'21.7K',rating:'4.9',color:'amber'}
];
