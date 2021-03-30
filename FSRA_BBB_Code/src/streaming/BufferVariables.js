/* New Variables Decared for SARA Algorithm*/

/*Variable that has to be changes with change in DATASET*/
var segment_Duration = 10;		/*Change this value accoring to the segment duration dataset you are using.*/

var total_Number_of_Segments = 47;

const delta = 20;
const B_max = 28;
const B_min = 20;
var B_resovier = 5;
var B_cap = 50;

var segment_Limit_Flag = 0;


var starttime = 0;
var starttime_flag = 0;
var console_Print_Time = 0;
var console_Print_counter = 0;

/***************************************/
/*One time initilatization variables*/
var lastSegmentFetchedIndex=-1;

var segmentVsQuality=[];

var segmentVsAvgThroughput=[];

var RED_log = [];

var current_Segment_Being_Downloaded = 0;



var number_Of_BSE = 0;

var buffer_Current = 0;		/*Current Buffer Length.*/

var available_bitrates=[];	/* This array contains the available set of bitrates */

var r_Max = 0;
var r_Min = 0;
var r_Current_No = 0;
var rate_next = 0;
var rate_prev = 0;

// for smmoth algo
var estdbw=[];
var probbw=[0];
var bw=0;
const arr=1.25; // for calcprobbw()
var be=0;
var final_rate=0;
var index=0;







//By default it is set to zero. Once it is set to one, that means, we are downloading the Init segments. This flag will allow to make thing smoothly in Fetching.

var IsItInitSegmentFlag=0; 
var myflag=0; //for temp use
var ctflag=0;
var v=0;
var mtflag=0;
var ct=0;
var nbs=0;
var hs=0;
var rmflag=0;
var vid=0;
var mf=0;
var bitrateflag=0;
var time=0;
var rbflag=0;
var rbe=0;

var sdflag=0;
var ctflag=0;
var vrepflag=0;

var n=1;
var rcurr=0;
var rcurr1=0;

var next=0;
var vrmin=0;
var vrmax;
var delay=0;
var wsum=0;
var wbdsum=0;
var wbd=0;
var sflag=0;
var sflagloop=0;
var mimeflag=0;



/*Declaration of Necessary Araays for SARA*/
var vrep=[]
var w=[];











