当遇到如下需求的时候：

需要同时展示多个不同类型的下拉框的时候；

<div><select name="withdrawYearLimit" class="withdrawYearLimit"><option value="0">0</option><option value="5">5</option><option value="10">10</option><option value="15">15</option><option value="20">20</option><option value="25">25</option></select>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<select name="withdrawWay" class="withdrawWay"><option value="1-年领">1-年领</option><option value="4-月领">4-月领</option><option value="5-趸领">5-趸领</option></select></div>
    
**解决思路如下：**

    
* 通过Javascript 代码，根据后台传递的数据动态显示select 下拉框；
* 
    解决思路：通过原生方式或者其他方式比如Jquery获取Dom 数组；
    
    document.getElementsByName('selectName');//or getElementsByClassName('selectClassName');
    
   
*  **example:** 后台获取到的动态数组如下；
     var yearLimit=[0,5,10,15,20,25];

    var withDrawWay=['1-年领','4-月领','5-趸领'];
    

* 调用执行以下JS 代码；

 
          /**
    		 *  select动态添加option;
    		 *  params: domObj为select Dom元素对象数组；
    		 *  example: nodeList[];
    		 *  arrData 为向每一个select Dom 元素中需要添加的数组；
    		 *  example:[0,5,10,15,20,25]；
    		 * */
    		 * 
        function dynamicOption(arrData,domObj){
	    	console.log(arrData);
	    	console.log(domObj);
	    	for(var j=0;j<domObj.length;j++){
		    	for(var i=0;i<arrData.length;i++){
		    	var option=document.createElement('option');
			    	option.value=arrData[i];
			    	option.innerText=arrData[i];
			    	console.log( option, domObj[j]);
			    	domObj[j].append(option);
	    
	    		}
    		}
    	}
  
		
		
		
		/**
		 *  多类型Select 多类型options时:
		 *  选择使用for循环调用动态添加函数dynamicOption
		 * params:selectList：需要动态添加的select Dom 数组；
		 * params:arrList：需要动态添加的options 数组；
		 * arrList[i] selectList[i]; 下标一一对应；
		 *
		 * */
        function initSelectInfo(arrList,selectList){

              for(var i=0;i<selectList.length;i++){
                  dynamicOption(arrList[i],selectList[i]);
			  }
        }