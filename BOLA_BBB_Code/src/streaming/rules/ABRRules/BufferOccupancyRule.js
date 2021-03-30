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
        storeLastRequestThroughputByType = function (type, lastRequestThroughput) {
            typ = type;
            throughputArray[type] = throughputArray[type] || [];
            if (lastRequestThroughput !== Infinity &&
                lastRequestThroughput !== throughputArray[type][throughputArray[type].length - 1]) {
                throughputArray[type].push(lastRequestThroughput);
            }
        },

        getAverageThroughput = function (type, isDynamic) {
            var averageThroughput = 0,
                sampleAmount = isDynamic ? AVERAGE_THROUGHPUT_SAMPLE_AMOUNT_LIVE : AVERAGE_THROUGHPUT_SAMPLE_AMOUNT_VOD,
                arr = throughputArray[type];
            try {


                len = arr.length;
                throw undefined;
            }
            catch (undefined) {
                // console.log("Exception caught");
                len = 0;
            }


            sampleAmount = len < sampleAmount ? len : sampleAmount;

            if (len > 0) {
                var startValue = len - sampleAmount,
                    totalSampledValue = 0;

                for (var i = startValue; i < len; i++) {
                    totalSampledValue += arr[i];
                }
                averageThroughput = totalSampledValue / sampleAmount;
            }

            try {


                if (arr.length > sampleAmount) {
                    arr.shift();
                }
                throw undefined;
            }
            catch (undefined) {
                // console.log("new one");
            }
            return averageThroughput;
        };


    return {
        debug: undefined,
        metricsModel: undefined,
        manifestModel: undefined,
        metricsExt: undefined,

        execute: function (context, callback) {
            var self = this,
                mediaInfo = context.getMediaInfo(),
                mediaType = mediaInfo.type,
                manifest = this.manifestModel.getValue(),			// Newly Added
                metrics = this.metricsModel.getReadOnlyMetricsFor(mediaType),
                isDynamic = context.getStreamProcessor().isDynamic(),		// Newly Added
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


            /* Handeling the Exceptational cases carefully, for throughput estimation. *
             if (!metrics || lastRequest === null || lastRequest.type !== MediaPlayer.vo.metrics.HTTPRequest.MEDIA_SEGMENT_TYPE ||
             bufferStateVO === null || bufferLevelVO === null) {
             callback(new MediaPlayer.rules.SwitchRequest());
             return;
             }
             */


            /*Storing the Stating time of the video*/
            if (starttime_flag == 0) {
                starttime = new Date().getTime();
//                console_Print_Time = starttime + 5000;
                 console_Print_Time = starttime + 479990 ;
                starttime_flag = 1;
            }


            /* Calculating the averageThroughput to be used in SARA Algo*/
            downloadTime = 0;
            averageThroughput = 0;
            lastRequestThroughput = 0;
            buffer_Current = parseFloat(document.getElementById("bl").innerHTML);
            /*Updating the current buffer value*/


            //Required for stats tracing
            if (buffer_Current < 1) {
                var now_temp = new Date().getTime();
                RED_log.push([now_temp, buffer_Current]);
            }


            //Required, if you are using Avg throughput.
            if (buffer_Current > 0) {
                //download time for the last fetched segment
                downloadTime = (lastRequest.tfinish.getTime() - lastRequest.tresponse.getTime()) / 1000;
                lastRequestThroughput = Math.round((lastRequest.trace[lastRequest.trace.length - 1].b) / downloadTime);

                storeLastRequestThroughputByType(mediaType, lastRequestThroughput);
                //computing the avgthroughput.
                averageThroughput = Math.round(getAverageThroughput(mediaType, isDynamic));
            }


            /*Updating the current_Segment_Being_Downloaded Variable*/
            current_Segment_Being_Downloaded = lastSegmentFetchedIndex + 1;


            if (current_Segment_Being_Downloaded > 3) {
                buffer_Current = parseFloat(document.getElementById("bl").innerHTML);
                if (buffer_Current > 20) {
                    var now = new Date().getTime();
                    var temp = 10;  //parseInt(buffer_Current - B_cap);
                    temp = (temp * 1000);
                    var delta_Wait = now + temp;

                    while (now < delta_Wait) {
                        buffer_Current = parseFloat(document.getElementById("bl").innerHTML);
                        /*Updating the current buffer value*/
                        if (buffer_Current < 1) {
                            var now_temp = new Date().getTime();
                            RED_log.push([now_temp, buffer_Current]);
                        }

                        now = new Date().getTime();
                    }

                    segment_Limit_Flag = 0;
                }

            }


            var already_Rep_Updated = 0;
            /*If the Rep for the segment is already decised in the last loop, just update the last value and call the same. */
            if (current_Segment_Being_Downloaded < segmentVsQuality.length) {
                // console.log("Entering into rep update");
                r_Current_No = segmentVsQuality[current_Segment_Being_Downloaded];
                switchRequest = new MediaPlayer.rules.SwitchRequest(r_Current_No, MediaPlayer.rules.SwitchRequest.prototype.STRONG);

                already_Rep_Updated = 1;
            }


            /*/Algo start ***********************************************************/

             /* find Vp and gp vslues based on bitrate and utilities  */
            function calcbolaparams(stableBufferTime, bitratelist, utilities) {


                const highestUtilityIndex = utilities.reduce((highestIndex, u, uIndex) = > (u > utilities[highestIndex] ? uIndex : highestIndex), 0
            )
                ;


                if (highestUtilityIndex === 0) {

                    return null;
                }

                const bufferTime = Math.max(stableBufferTime, MINIMUM_BUFFER_S + MINIMUM_BUFFER_PER_BITRATE_LEVEL_S * bitratelist.length);

                // TODO: Investigate if following can be better if utilities are not the default Math.log utilities.
                // If using Math.log utilities, we can choose Vp and gp to always prefer bitrates[0] at minimumBufferS and bitrates[max] at bufferTarget.
                // (Vp * (utility + gp) - bufferLevel) / bitrate has the maxima described when:
                // Vp * (utilities[0] + gp - 1) === minimumBufferS and Vp * (utilities[max] + gp - 1) === bufferTarget
                // giving:
                const gp = (utilities[highestUtilityIndex] - 1) / (bufferTime / MINIMUM_BUFFER_S - 1);
                const Vp = MINIMUM_BUFFER_S / gp;
                // note that expressions for gp and Vp assume utilities[0] === 1, which is true because of normalization
                // console.log("calcbolaparams is over");
                return {gp: gp, Vp: Vp};

            }



            /* Initialise various states in BOLA algo such as STARTUP state and STEADY state etc.. */
            function initialbolaparams(context) // used this to get parameters Vp and gp
            {


                const mediaInfo = context.getMediaInfo();

                const stableBufferTime = 20;
                bitratelist = [];
                var i = 0;

                for (var seg_Key = 0; seg_Key < current_Segment_Being_Downloaded; seg_Key++)        /*Where, "seg_Key" is the segment number. */
                {

                    var rep_Key = segmentVsQuality[seg_Key];

                    bitratelist[i] = vrep[rep_Key];
                    i++;
                }


                let utilities = bitratelist.map(b = > Math.log(b))

                utilities = utilities.map(u = > u - utilities[0] + 1)

                const params = calcbolaparams(stableBufferTime, bitratelist, utilities);

                if (!params) {
                    // only happens when checkBolaStateStableBufferTimethere is only one bitrate level
                    // at start of playing BOLA_STATE_ONE_BITRATE is the first state

                    initialState.state = BOLA_STATE_ONE_BITRATE;
                    initialState.Vp = 1;
                    initialState.gp = 1;

                } else {
                    initialState.state = BOLA_STATE_STARTUP;

                    initialState.bitrates = bitratelist;
                    initialState.utilities = utilities;
                    initialState.stableBufferTime = stableBufferTime;
                    initialState.Vp = params.Vp;
                    initialState.gp = params.gp;

                    initialState.lastQuality = 0;

                }

                return initialState;


            }


            /* Calculate a buffer time which will be used to determine how much duration of video
               is present in the buffer  and this buffer time is added into placeholder buffer */
            function checkforstablebuffer(bolaState, mediaType) {


                if (bolaState.stableBufferTime !== stableBufferTime) {
                    const params = calcbolaparams(stableBufferTime, bitratelist, utilities);
                    if (params.Vp !== bolaState.Vp || params.gp !== bolaState.gp && (bolaState.Vp == null || bolaState.gp == null )) {
                        // correct placeholder buffer using two criteria:
                        // 1. do not change effective buffer level at effectiveBufferLevel === MINIMUM_BUFFER_S ( === Vp * gp )
                        // 2. scale placeholder buffer by Vp subject to offset indicated in 1.

                        //const bufferLevel = dashMetrics.getCurrentBufferLevel(metricsModel.getReadOnlyMetricsFor(mediaType));
                        //buffer_Current
                        let effectiveBufferLevel = buffer_Current + bolaState.placeholderBuffer;

                        effectiveBufferLevel -= MINIMUM_BUFFER_S;
                        effectiveBufferLevel *= params.Vp / bolaState.Vp;
                        effectiveBufferLevel += MINIMUM_BUFFER_S;

                        bolaState.stableBufferTime = stableBufferTime;
                        bolaState.Vp = params.Vp;
                        bolaState.gp = params.gp;
                        bolaState.placeholderBuffer = Math.max(0, effectiveBufferLevel - bufferLevel);
                        // console.log("placeholder value is "+bolaState.placeholderBuffer)
                    }
                }
            }

            //stream id is used for getting top quality buffer obtained from streamInfo
            const streamInfo = context.getMediaInfo();
            const streamId = streamInfo ? streamInfo.id : null;
            let bolaStateDict = 0;

            const mediainfo = context.getMediaInfo();


            // This returns the state of the player during video playback

            function getbolastate(context) {
                let bolaState = bolaStateDict;
                if (!bolaState) {

                    bolaState = initialbolaparams(context);
                    bolaStateDict = bolaState;
                } else if (bolaState.state !== BOLA_STATE_ONE_BITRATE) {

                    checkforstablebuffer(bolaState, mediaType);
                }
                return bolaState;

            }


// safethroughput and latency are needed to implement BOLA -O ( oscillations )

            const safeThroughput = Math.round(getAverageThroughput(mediaType, isDynamic));


            // returns the low quality for a given buffer level
            function minbuffer(bolaState, quality)
            {

                var qBitrate = bolaState.bitrates[quality];  // get bitrate based on current quality
                var qUtility = bolaState.utilities[quality];  // get utility based on current quality

                let minlevel = 0;
                for (var i = quality - 1; i >= 0; i--) {
                    if (bolaState.utilities[i] < bolaState.utilities[quality]) {
                        const ibitrate = bolaState.bitrates[i];
                        const iutility = bolaState.utilities[i];

                        const minlevel = bolaState.Vp * (bolaState.gp + (qBitrate * iutility - ibitrate * qUtility) / (qBitrate - ibitrate));

                        min = Math.max(min, minlevel); // we want min to be small but at least level(i) for all i

                    }


                }

                return min;
            };

             // using this to update placeholderbuffer
            function placeholderBufferupdate(bolaState, mediaType)
            {


                if (!isNaN(lastRequest.tfinish.getTime())) {

                    const delay = 0.001 * (Date.now() - lastRequest.tfinish.getTime());
                    bolaState.placeholderBuffer += Math.max(0, delay);

                }
                else if (!isNaN(lastRequest.tresponse.getTime())) {
                    const delay = 0.001 * (Date.now() - lastRequest.tresponse.getTime());
                    bolaState.placeholderBuffer += Math.max(0, delay);

                }
                checkforstablebuffer(bolaState, mediaType)
            }


             /* Get quality index using bolastate and bufferlevel  */
            function getqualityfrombuffer(bolaState, bufferlevel) {
                const bitrateCount = bolaState.bitrates.length;
                let quality = NaN;
                let score = NaN;
                for (let i = 0; i < bitrateCount; ++i) {
                    let s = (bolaState.Vp * (bolaState.utilities[i] + bolaState.gp) - bufferLevel) / bolaState.bitrates[i];
                    if (isNaN(score) || s >= score) {
                        score = s;
                        quality = i;
                    }
                }
                return quality;
            }
            const StreamProcessorDict = []

            /* return the bitrate   */

            function getqualityforbitrate(mediaInfo, bitratelist, latency) {


                if (latency && mediaInfo) {
                    latency = latency / 1000;

                    const fragmentDuration = 10;
                    if (latency > fragmentDuration) {
                        return 0;
                    } else {
                        const deadTimeRatio = latency / fragmentDuration;
                        for (var i = 0; i < bitratelist.length - 1; i++) {


                            bitratelist[i] = bitratelist[i] * (1 - deadTimeRatio);
                        }
                    }
                }

                if (!bitratelist || bitratelist.length === 0) {
                    return QUALITY_DEFAULT;
                }

                for (let i = bitratelist.length - 1; i >= 0; i--) {
                    const bitrateInfo = bitratelist[i];
                    if (bitratelist[i - 1] >= bitrateInfo) {
                        return i;
                    }
                }


                return 0;
            }

            function gettopqualityindex(type, id) {
                let idx;
                topQualities[id] = topQualities[id] || {};

                if (!topQualities[id].hasOwnProperty(type)) {
                    topQualities[id][type] = 0;
                }


                let newIdx = idx;

                if (!streamProcessorDict[type]) {
                    return newIdx;
                }

                const minIdx = getMinAllowedIndexFor(type);
                if (minIdx !== undefined) {
                    newIdx = Math.max(idx, minIdx);
                }

                const maxIdx = getMaxAllowedIndexFor(type);
                if (maxIdx !== undefined) {
                    newIdx = Math.min(newIdx, maxIdx);
                }
                idx = newIdx //value of idx after checkmaxbitrate


                // idx = checkMaxRepresentationRatio(idx, type, topQualities[id][type]);
                // start of checkmaxrepresentationratio

                const maxRepresentationRatio = getMaxAllowedRepresentationRatioFor(type);
                if (isNaN(maxRepresentationRatio) || maxRepresentationRatio >= 1 || maxRepresentationRatio < 0) {
                    return idx;
                }
                idx = Math.min(idx, Math.round(maxIdx * maxRepresentationRatio));
                // value of idx after checkmaxrepresentationratio


                //    idx = checkPortalSize(idx, type);
                // start of checkportalsize


                if (type !== Constants.VIDEO || !limitBitrateByPortal || !streamProcessorDict[type]) {
                    if (type !== Constants.VIDEO || !limitBitrateByPortal || !streamProcessorDict[type]) {
                        return idx;
                    }

                    if (!windowResizeEventCalled) {
                        setElementSize();
                    }

                    const manifest = manifestModel.getValue();
                    const representation = dashManifestModel.getAdaptationForType(manifest, 0, type).Representation;
                    let newIdx = idx;

                    if (elementWidth > 0 && elementHeight > 0) {
                        while (
                        newIdx > 0 &&
                        representation[newIdx] &&
                        elementWidth < representation[newIdx].width &&
                        elementWidth - representation[newIdx - 1].width < representation[newIdx].width - elementWidth
                            ) {
                            newIdx = newIdx - 1;
                        }

                        if (representation.length - 2 >= newIdx && representation[newIdx].width === representation[newIdx + 1].width) {
                            newIdx = Math.min(idx, newIdx + 1);
                        }
                    }

                    return newIdx;
                }


            }


            bolaState = getbolastate(context);
            switch (bolaState.state) {
                case BOLA_STATE_STARTUP:


                    for (var seg_Key = 0; seg_Key < current_Segment_Being_Downloaded; seg_Key++)        /*Where, "seg_Key" is the segment number. */
                    {

                        var rep_Key = segmentVsQuality[seg_Key];
                        bitratelist[i] = vrep[rep_Key];
                        i++;
                    }

                    var quality;
                    quality = getqualityforbitrate(mediaInfo, bitratelist, latency);


                    switchRequest.quality = quality;  // set current quality as reference for getting next seg quality

                    let bufferlevel = parseFloat(document.getElementById("bl").innerHTML);

                    bolaState.placeholderBuffer = Math.max(0, minbuffer(bolaState, quality) - bufferlevel);
                    bolaState.lastQuality = quality;                    // set present quality as the last quality

                    if (bufferlevel > buffer_limit) {

                        bolaState.state = BOLA_STATE_STEADY;

                    }
                    break;

                case BOLA_STATE_STEADY:


                    placeholderBufferupdate(bolaState, mediaType);  
                    bufferlevel = parseFloat(document.getElementById("bl").innerHTML);

                    quality = getqualityfrombuffer(bolaState, bufferlevel + bolaState.placeholderBuffer); // get quality for the current buffer level

                    const qualityforthroughput = getqualityforbitrate(mediaInfo, safeThroughput, latency);

                    if (quality > bolaState.lastQuality && quality > qualityforthroughput) {
                        quality = Math.max(bolaState.lastQuality, qualityforthroughput);

                    }
                    // to slow down the filling of placeholder buffer we need delay var which is defined as follows:
                    bufferlevel = parseFloat(document.getElementById("bl").innerHTML);


                    delay = Math.max(0, bufferlevel + bolaState.placeholderBuffer - (bolaState.Vp * (bolaState.utilities[quality] + bolaState.gp)));

                    if (delay <= bolaState.placeholderBuffer) {
                        bolaState.placeholderBuffer -= delay;
                        delay = 0;
                    }
                    else {
                        delay -= bolaState.placeholderBuffer;
                        bolaState.placeholderBuffer = 0;
                    }
                    if (quality < gettopqualityindex(mediaType, streamId)) {


                        streamProcessor.getScheduleController().setTimeToLoadDelay(1000 * delayS);
                    }
                    else {
                        delay = 0;

                    }

                    switchRequest.quality = quality;
                    switchRequest.reason.throughput = throughput;
                    switchRequest.reason.latency = latency;
                    switchRequest.reason.bufferLevel = bufferlevel;
                    switchRequest.reason.placeholderBuffer = bolaState.placeholderBuffer;
                    switchRequest.reason.delay = delayS;

                    bolaState.lastQuality = quality;

                    rate_next = bolaState.lastQuality;
                   
                    break;
                case BOLA_STATE_ONE_BITRATE:


                    var max_rep_count = vrep.length - 1;
                    if (rate_next < max_rep_count) {
                        rate_next += 1;
                    }

                    bolaState.state = BOLA_STATE_STARTUP;

                    break;

            }


            if (already_Rep_Updated == 0) {

                r_Current_No = rate_next;       //Your quality output will be assigned here..


                /* Sending the Newly selected representation to the Switch request.*/
                switchRequest = new MediaPlayer.rules.SwitchRequest(r_Current_No, MediaPlayer.rules.SwitchRequest.prototype.STRONG);

            }


            /*updating the Number of Bitrate Switching Events..  */
            if (current_Segment_Being_Downloaded == segmentVsQuality.length && current_Segment_Being_Downloaded != 0) {
                if (r_Current_No != segmentVsQuality[segmentVsQuality.length - 1]) {
                    number_Of_BSE++;
                }
            }


            if (current_Segment_Being_Downloaded == segmentVsQuality.length) {


                segmentVsQuality[segmentVsQuality.length] = r_Current_No;
                /*updating the current selected rep no to the segment number. */


            }

            /******** OSMF Functions End here **********/


            if (switchRequest.value !== MediaPlayer.rules.SwitchRequest.prototype.NO_CHANGE) {
                self.debug.log("BufferOccupancyRule requesting switch to index: ", switchRequest.value, "type: ", mediaType, " Priority: ",
                    switchRequest.priority === MediaPlayer.rules.SwitchRequest.prototype.DEFAULT ? "Default" :
                        switchRequest.priority === MediaPlayer.rules.SwitchRequest.prototype.STRONG ? "Strong" : "Weak");
            }


            /* Printing the final OQoE statics..*/
// if(console_Print_counter %10 == 0)
// {
            var Temp_time = new Date().getTime();
            if (/*(current_Segment_Being_Downloaded > total_Number_of_Segments)&&*/ (Temp_time > console_Print_Time)) {
                console.log("OQoE Statics are:");
                var bitratelist = [];
                var i = 0;
                for (var seg_Key = 0; seg_Key < current_Segment_Being_Downloaded; seg_Key++)        /*Where, "seg_Key" is the segment number. */
                {

                    var rep_Key = segmentVsQuality[seg_Key];
                    console.log(seg_Key + "  " + rep_Key + "   " + vrep[rep_Key]);
                    bitratelist[i] = vrep[rep_Key];
                    i++;
                }
               

                console.log("-----------------");

                console.log("Number of BSE : " + number_Of_BSE);
                console.log("Average Throughput: " + averageThroughput);


                var number_of_Rebuffers = 0;
                number_of_Rebuffers = parseFloat(document.getElementById("re").innerHTML);
                if (number_of_Rebuffers > 0) {
                    number_of_Rebuffers = number_of_Rebuffers - 1;
                    console.log("Number of rebuffering Events : " + number_of_Rebuffers);
                }
                else {
                    console.log("Number of rebuffering Events : " + number_of_Rebuffers);
                }


                console.log("Printing the RED Log");
                console.log("---------------------");
                for (var Key = 0; Key < RED_log.length; Key++)        /*Where, "seg_Key" is the segment number. */
                {
                    console.log(RED_log[Key][0] + "  " + RED_log[Key][1]);
                }
                console.log("---------------------");


                var startup_Delay = 0;
                startup_Delay = parseFloat(document.getElementById("sd").innerHTML);
                console.log("Startup Delay is: " + startup_Delay);

                var highest_Bitrate_Reached = 0;
                highest_Bitrate_Reached = parseFloat(document.getElementById("hvt").innerHTML);
                console.log("Time taken to reach Highest Bitrate : " + highest_Bitrate_Reached);

                /* Calculation of Average Bitrate Perceived by the Player */
                var total_Bitrate_Sum = 0;
                var avg_Bitrate = 0;


                for (var seg_Key = 0; seg_Key < current_Segment_Being_Downloaded; seg_Key++)        /*Where, "seg_Key" is the segment number. */
                {
                    var rep_Key = segmentVsQuality[seg_Key];

                    total_Bitrate_Sum = total_Bitrate_Sum + vrep[rep_Key];
                }

                avg_Bitrate = total_Bitrate_Sum / current_Segment_Being_Downloaded;
                console.log("Average Bitrate Perceived: " + avg_Bitrate);

                /* Printing the segment wise bitrates perceived.*/
                console.log("The Segment ise Bitrates");
                console.log("-------------------------");
                for (var seg_Key = 0; seg_Key < current_Segment_Being_Downloaded; seg_Key++)        /*Where, "seg_Key" is the segment number. */
                {
                    var rep_Key = segmentVsQuality[seg_Key];
                   
                    console.log(seg_Key + "  " + rep_Key + "   " + vrep[rep_Key]);
                }
            }

// }
// console_Print_counter = console_Print_counter+1;

            callback(switchRequest);		// At this place, we are calling the switchRequest with new/old value...
        }
    }
};

MediaPlayer.rules.BufferOccupancyRule.prototype = {
    constructor: MediaPlayer.rules.BufferOccupancyRule
};





