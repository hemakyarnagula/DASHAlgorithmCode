/*
 * The copyright in this software is being made available under the BSD License, included below. This software may be subject to other third party and contributor rights, including patent rights, and no such rights are granted under this license.
 * 
 * Copyright (c) 2014, Akamai Technologies
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 * •  Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * •  Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * •  Neither the name of the Digital Primates nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS” AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
MediaPlayer.rules.BufferOccupancyRule = function () {
    "use strict";


 var throughputArray = [],
        AVERAGE_THROUGHPUT_SAMPLE_AMOUNT_LIVE = 2,
        AVERAGE_THROUGHPUT_SAMPLE_AMOUNT_VOD = 3,
        //THROUGHTPUT_RATIO_SAFETY_FACTOR = 1.2,
	typ,
        storeLastRequestThroughputByType = function (type, lastRequestThroughput) {typ=type;
            throughputArray[type] = throughputArray[type] || [];
            if (lastRequestThroughput !== Infinity &&
                lastRequestThroughput !== throughputArray[type][throughputArray[type].length-1]) {
                throughputArray[type].push(lastRequestThroughput);
            }
        },

        getAverageThroughput = function (type,  isDynamic) {
            var averageThroughput = 0,
                sampleAmount = isDynamic ? AVERAGE_THROUGHPUT_SAMPLE_AMOUNT_LIVE: AVERAGE_THROUGHPUT_SAMPLE_AMOUNT_VOD,
                arr = throughputArray[type],
                len = arr.length;

            sampleAmount = len < sampleAmount ? len : sampleAmount;

            if (len > 0) {
                var startValue = len - sampleAmount,
                    totalSampledValue = 0;

                for (var i = startValue; i < len; i++) {
                    totalSampledValue += arr[i];
                }
                averageThroughput = totalSampledValue / sampleAmount;
            }

            if (arr.length > sampleAmount) {
                arr.shift();
            }
		
            return averageThroughput;
        };


	
    return {
        debug: undefined,
        metricsModel: undefined,
        manifestModel:undefined,
	metricsExt: undefined,

        execute: function (context, callback) {
            var self = this,
                mediaInfo = context.getMediaInfo(),
                mediaType = mediaInfo.type,
                manifest = this.manifestModel.getValue(),			// Newly Added
                metrics = this.metricsModel.getReadOnlyMetricsFor(mediaType),
                isDynamic= context.getStreamProcessor().isDynamic(),		// Newly Added
		lastRequest = self.metricsExt.getCurrentHttpRequest(metrics),
                downloadTime,
                averageThroughput,
                lastRequestThroughput,
                bufferStateVO = (metrics.BufferState.length > 0) ? metrics.BufferState[metrics.BufferState.length - 1] : null,
                bufferLevelVO = (metrics.BufferLevel.length > 0) ? metrics.BufferLevel[metrics.BufferLevel.length - 1] : null,
		/*Above Added for Throughput estimation */
                lastBufferLevelVO = (metrics.BufferLevel.length > 0) ? metrics.BufferLevel[metrics.BufferLevel.length - 1] : null,
                lastBufferStateVO = (metrics.BufferState.length > 0) ? metrics.BufferState[metrics.BufferState.length - 1] : null,
                isBufferRich = false,
                maxIndex = mediaInfo.trackCount - 1,
                switchRequest = new MediaPlayer.rules.SwitchRequest(MediaPlayer.rules.SwitchRequest.prototype.NO_CHANGE, MediaPlayer.rules.SwitchRequest.prototype.WEAK);



/* Algo implementations starts here//*/


		/* Handeling the Exceptational cases carefully, for throughput estimation. *
          	if (!metrics || lastRequest === null || lastRequest.type !== MediaPlayer.vo.metrics.HTTPRequest.MEDIA_SEGMENT_TYPE ||
                	bufferStateVO === null || bufferLevelVO === null) {
                	callback(new MediaPlayer.rules.SwitchRequest());
	                return;
        	}
		*/


		/*Storing the Stating time of the video*/
		if(starttime_flag == 0)
		{
			starttime = new Date().getTime();
			console_Print_Time = starttime + 479990 ;
			starttime_flag = 1;
		}




		/* Calculating the averageThroughput to be used in SARA Algo*/
		downloadTime = 0;
		averageThroughput = 0;
		lastRequestThroughput = 0;
		buffer_Current = parseFloat(document.getElementById("bl").innerHTML);	/*Updating the current buffer value*/


		if(buffer_Current < 1)
		{
			var now_temp = new Date().getTime();
			RED_log.push([ now_temp, buffer_Current ]);
		}



		if(buffer_Current > 0)
		{
		downloadTime = (lastRequest.tfinish.getTime() - lastRequest.tresponse.getTime())/1000;
            	lastRequestThroughput = Math.round((lastRequest.trace[lastRequest.trace.length - 1].b) / downloadTime);

	        storeLastRequestThroughputByType(mediaType, lastRequestThroughput);
        	averageThroughput = Math.round(getAverageThroughput(mediaType, isDynamic));
		}


		/*Updating the current_Segment_Being_Downloaded Variable*/
		current_Segment_Being_Downloaded = lastSegmentFetchedIndex + 1;

		if( current_Segment_Being_Downloaded > 3 )
		{
			buffer_Current = parseFloat(document.getElementById("bl").innerHTML);
			if(buffer_Current > 30) 
			{ 	var now = new Date().getTime();
				var temp = 10;
				temp = (temp * 1000);
				var delta_Wait = now + temp;

				var push_temp = new Date().getTime();
				while(now < delta_Wait)
				{
					buffer_Current = parseFloat(document.getElementById("bl").innerHTML);	/*Updating the current buffer value*/
					if(buffer_Current < 1)
					{
						var now_temp = new Date().getTime();
						var diff_temp = now_temp - push_temp;
						if(diff_temp > 4000)
						{
						RED_log.push([ now_temp, buffer_Current ]);
						push_temp = new Date().getTime();
						}
						break;
					}
		
					now = new Date().getTime();
				}
			}
		segment_Limit_Flag = segment_Limit_Flag +1;		//Updating the segment_Limit_Flag to check continious downloads
	}



/*
	buffer_Current = parseFloat(document.getElementById("bl").innerHTML);	
	if((segment_Limit_Flag > 5) && (buffer_Current > 5))
	{
		var now = new Date().getTime();
		var temp = parseInt(segment_Duration);
		temp = (temp * 1000);
		var delta_Wait = now + temp;

		while( now < delta_Wait )
		{

			buffer_Current = parseFloat(document.getElementById("bl").innerHTML);	//Updating the current buffer value
			if(buffer_Current < 1)
			{
				var now_temp = new Date().getTime();
				RED_log.push([ now_temp, buffer_Current ]);
			}

			now = new Date().getTime();
		}
		segment_Limit_Flag = 0;
	}
*/



		var already_Rep_Updated = 0;
		/*If the Rep for the segment is already decised in the last loop, just update the last value and call the same. */
		if(current_Segment_Being_Downloaded < segmentVsQuality.length)
		{
			r_Current_No = segmentVsQuality[current_Segment_Being_Downloaded];
			switchRequest = new MediaPlayer.rules.SwitchRequest(r_Current_No, MediaPlayer.rules.SwitchRequest.prototype.STRONG);
	
			already_Rep_Updated = 1;
		}



/* QAAD (Rate-based) Algorithm Starts Here..*/
/*---------------------------*/
	r_Max = mediaInfo.trackCount - 1;	//Max available Rep Index
	l_prev = r_Current_No;
	l_next = r_Current_No;		//Assigned for safe side
	averageThroughput = Math.round(averageThroughput/8);	// Convering the averageThroughput into Bps.

	
	/*Deciding the "l_best" value*/
	var loop_i =0;
	for(loop_i =0; loop_i <= r_Max; loop_i++)
	{

		//console.log("In averageThroughput:  "+averageThroughput);
		//console.log("In vrep[loop_i] "+vrep[loop_i]);
		if(vrep[loop_i] < averageThroughput)
		{
			l_best = loop_i;
		}
	}

/*Actuall Algorithm goes Here.. */
if(l_best == l_prev)
{
	l_next = l_prev;
}
else
{
	if(l_best > l_prev)
	{
		buffer_Current = parseFloat(document.getElementById("bl").innerHTML);	/*Updating the current buffer*/
		if(buffer_Current > marginal_Buffer_Length)
		{
			l_next = l_prev +1;
		}
		else
		{
			l_next = l_prev;
		}
	}
	else
	{
		if(l_best < l_prev)
		{
		var t_lprev_minus_k = 0;
		var n_lprev_minus_k = 0;
		var k = 0;
		do {
    			buffer_Current = parseFloat(document.getElementById("bl").innerHTML);	/*Updating the current buffer*/
			var temp_1 = (buffer_Current - minimal_Buffer_Length);
			var temp_2 =  Math.round(averageThroughput/vrep[(l_prev - k)]);
	
			t_lprev_minus_k = Math.round(temp_1/(1-temp_2));

			var temp_3 = Math.round(t_lprev_minus_k * averageThroughput);
			var temp_4 = Math.round(segment_Duration * vrep[(l_prev - k)]);

			n_lprev_minus_k = Math.round(temp_3/temp_4);

			k++;
		  }
		  while ( (n_lprev_minus_k < 1) && (k < (l_prev-1)) );

		  l_next = (l_prev - k);

		}	//End of If loop
	}	//End of Second level Else..

}	//End of Main Else


/************** QADD Algo End ********************/
		

if(already_Rep_Updated == 0)
{
	//console.log("rate_next is: "+l_next);
	r_Current_No = l_next;
	/* Sending the Newly selected representation to the Switch request.*/
	switchRequest = new MediaPlayer.rules.SwitchRequest(r_Current_No, MediaPlayer.rules.SwitchRequest.prototype.STRONG);
}


/*updating the Number of Bitrate Switching Events..  */
if(current_Segment_Being_Downloaded == segmentVsQuality.length && current_Segment_Being_Downloaded != 0)
{
	if(r_Current_No != segmentVsQuality[segmentVsQuality.length - 1])
	{
		number_Of_BSE++;
	}	
}


if(current_Segment_Being_Downloaded == segmentVsQuality.length)
{
	segmentVsQuality[segmentVsQuality.length] = r_Current_No;	/*updating the current selected rep no to the segment number. */
	
}

/******** OSMF Functions End here **********/


            if (switchRequest.value !== MediaPlayer.rules.SwitchRequest.prototype.NO_CHANGE) {
                self.debug.log("BufferOccupancyRule requesting switch to index: ", switchRequest.value, "type: ",mediaType, " Priority: ",
                    switchRequest.priority === MediaPlayer.rules.SwitchRequest.prototype.DEFAULT ? "Default" :
                        switchRequest.priority === MediaPlayer.rules.SwitchRequest.prototype.STRONG ? "Strong" : "Weak");
            }



/* Printing the final OQoE statics..*/


if( (console_Print_Counter%10) == 0 ) 
{
var Temp_time = new Date().getTime();

if((current_Segment_Being_Downloaded > total_Number_of_Segments) && (Temp_time > console_Print_Time))
{
	console.log("OQoE Statics are:");
	console.log("-----------------");

	console.log("Number of BSE : "+number_Of_BSE);
	console.log("Average Throughput: "+averageThroughput);


	var number_of_Rebuffers = 0;
	number_of_Rebuffers = parseFloat(document.getElementById("re").innerHTML);
	if(number_of_Rebuffers > 0)
	{	number_of_Rebuffers = number_of_Rebuffers - 1;
		console.log("Number of rebuffering Events : "+number_of_Rebuffers);
	}
	else
	{	console.log("Number of rebuffering Events : "+number_of_Rebuffers);	}


	console.log("Printing the RED Log");
	console.log("---------------------");
	var past_temp_log = 0;
	for(var Key=0; Key < RED_log.length; Key++)		/*Where, "seg_Key" is the segment number. */
	{	
		var temp = RED_log[Key][0] -past_temp_log;
		if(temp>50)					//Modified to avoid the repeat printing. Act accordingly.
		{
			console.log(RED_log[Key][0]+"  "+RED_log[Key][1]);
			past_temp_log = RED_log[Key][0];
		}
	}
	console.log("---------------------");
	

	var startup_Delay = 0;
	startup_Delay = parseFloat(document.getElementById("sd").innerHTML);
	console.log("Startup Delay is: "+startup_Delay);

	var highest_Bitrate_Reached = 0;
	highest_Bitrate_Reached = parseFloat(document.getElementById("hvt").innerHTML);
	console.log("Time taken to reach Highest Bitrate : "+highest_Bitrate_Reached);

	/* Calculation of Average Bitrate Perceived by the Player */
	var total_Bitrate_Sum = 0;
	var avg_Bitrate = 0;
	

	for(var seg_Key=0; seg_Key < current_Segment_Being_Downloaded; seg_Key++)		/*Where, "seg_Key" is the segment number. */
	{
		var rep_Key = segmentVsQuality[seg_Key];

		total_Bitrate_Sum = total_Bitrate_Sum + vrep[rep_Key];
	}

	avg_Bitrate = total_Bitrate_Sum / current_Segment_Being_Downloaded;
	console.log("Average Bitrate Perceived: "+avg_Bitrate);

	/* Printing the segment wise bitrates perceived.*/
	console.log("The Segment ise Bitrates");
	console.log("-------------------------");
	for(var seg_Key=0; seg_Key < current_Segment_Being_Downloaded; seg_Key++)		/*Where, "seg_Key" is the segment number. */
	{
		var rep_Key = segmentVsQuality[seg_Key];
		console.log(seg_Key+"  "+rep_Key+"   "+vrep[rep_Key]);
	}
}	//End of console_Print_Time
}	//End of console_Print_Counter
console_Print_Counter = console_Print_Counter +1;


            callback(switchRequest);		// At this place, we are calling the switchRequest with new/old value...
        }
    };
};

MediaPlayer.rules.BufferOccupancyRule.prototype = {
    constructor: MediaPlayer.rules.BufferOccupancyRule
};
