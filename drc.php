﻿<!DOCTYPE html>
<html lang='en' class='no-js'>

	<head>
		<title>Dodging Rain Competition</title>
		<meta charset='UTF-8'>
		<meta name='viewport' content='width=device-width'>
		<meta name='description' content='Webpage intended for the Dodging Rain Competition (DRC).'>
		<meta name='keywords' content='touhou, touhou project, 東方, 东方, drc, shooting game, shoot em up, shmup, stg, dodging, rain, competition'>
		<link rel='stylesheet' type='text/css' href='assets/drc/drc.css'>
		<link rel='stylesheet' href='https://fonts.googleapis.com/css?family=Felipa&display=swap'>
		<link rel='icon' type='x/icon' href='assets/drc/drc.ico'>
		<script src='assets/shared/jquery.js' defer></script>
		<script src='assets/shared/utils.js' defer></script>
        <script src='assets/drc/drc.js' defer></script>
        <script src='assets/shared/sorttable.js' defer></script>
        <script src='assets/shared/modernizr-custom.js' defer></script>
        <script>document.documentElement.classList.remove("no-js");</script>
	</head>

	<body>
		<div id='nav' class='wrap'>
			<nav>
				<?php
					$nav = file_get_contents('nav.html');
					$page = str_replace('.php', '', basename(__FILE__));
					$nav = str_replace('<a href="' . $page . '">', '<strong>', $nav);
					$cap = strlen($page) < 4 ? strtoupper($page) : ucfirst($page);
					echo str_ireplace($page . '</a>', $cap . '</strong>', $nav);
				?>
			</nav>
		</div>
		<div id='wrap' class='wrap'>
			<table id='top' class='center noborders'>
				<tr class='noborders'>
					<td id='emptytd' class='noborders' style='width:22%'></td>
					<td id='languagestd' class='noborders' style='width:55%'><table id='languages' class='noborders'>
		                <tbody>
		                    <tr class='noborders'>
		                        <td class='noborders'>
		                            <a href='javascript:setLanguage("English")'><img src='assets/flags/uk.png' alt='Flag of the United Kingdom'></a>
		                        </td>
		                        <td class='noborders'>
		                            <a href='javascript:setLanguage("Japanese")'><img src='assets/flags/japan.png' alt='Flag of Japan'></a>
		                        </td>
		                        <td class='noborders'>
		                            <a href='javascript:setLanguage("Chinese")'><img src='assets/flags/china.png' alt='Flag of the P.R.C.'></a>
		                        </td>
		                    </tr>
		                    <tr class='noborders'>
		                        <td class='noborders'><a href='javascript:setLanguage("English")'>English</a></td>
		                        <td class='noborders'><a href='javascript:setLanguage("Japanese")'>日本語</a></td>
		                        <td class='noborders'><a href='javascript:setLanguage("Chinese")'>简体中文</a></td>
		                    </tr>
		                </tbody>
		            </table></td>
					<td class='noborders' style='width:22%;text-align:right;vertical-align:top'><img id='hy' src='assets/shared/h-bar.png' title='Human Mode' onClick='theme(this)'></td>
				</tr>
			</table>
			<h1>Dodging Rain Competition</h1>
            <p id='drcIntro'></p>
            <p id='drcIntroPts'></p>
            <p id='countdown'></p>
            <h2 id='pointsCalculator'>Points Calculator</h2>
            <p id='drcScores'></p>
            <p id='notify'></p>
            <label id='category' for='game'></label>
            <select id='game' onChange='checkValues(true, true, true);'>
                <option id='hrtp' value='HRtP'>HRtP</option>
                <option id='soew' value='SoEW'>SoEW</option>
                <option id='podd' value='PoDD'>PoDD</option>
                <option id='lls' value='LLS'>LLS</option>
                <option id='ms' value='MS'>MS</option>
                <option id='eosd' value='EoSD'>EoSD</option>
                <option id='pcb' value='PCB'>PCB</option>
                <option id='in' value='IN'>IN</option>
                <option id='pofv' value='PoFV'>PoFV</option>
                <option id='mof' value='MoF'>MoF</option>
                <option id='sa' value='SA'>SA</option>
                <option id='ufo' value='UFO'>UFO</option>
                <option id='ds' value='DS'>DS</option>
                <option id='gfw' value='GFW'>GFW</option>
                <option id='td' value='TD'>TD</option>
                <option id='ddc' value='DDC'>DDC</option>
                <option id='lolk' value='LoLK'>LoLK</option>
                <option id='hsifs' value='HSiFS'>HSiFS</option>
                <option id='wbawc' value='WBaWC'>WBaWC</option>
            </select>
            <label id='difficultyLabel' for='difficulty'></label>
            <select id='difficulty' onChange='if ($(GAME).val() == "GFW") { checkShottypes(true); } if ($(GAME).val() == "IN" || $(GAME).val() == "HSiFS") { checkValues(true, false, false); }'>
                <option>Easy</option>
                <option>Normal</option>
                <option>Hard</option>
                <option>Lunatic</option>
                <option>Extra</option>
            </select>
            <select id='route' style='display:none'>
                <option id='finala' value='FinalA'>FinalA</option>
                <option id='finalb' value='FinalB'>FinalB</option>
            </select>
            <label id='challengeLabel' for='challenge'></label>
            <select id='challenge' onChange='checkValues(true, false, false); checkShottypes(false);'>
                <option id='scoring0' value='Scoring'>Scoring</option>
                <option id='survival0' value='Survival'>Survival</option>
            </select>
            <div id='performance'></div>
            <label id='shottypeLabel' for='shottype'></label><select id='shottype' onChange='checkValues(false, false, false)'></select>
            <select id='season'>
                <option id='spring' value='Spring'>Spring</option>
                <option id='summer' value='Summer'>Summer</option>
                <option id='autumn' value='Autumn'>Autumn</option>
                <option id='winter' value='Winter'>Winter</option>
            </select>
			<div id='drcpoints'></div>
            <div id='error'></div>
			<p><input id='calculate' type='button' onClick='drcPoints()' value='Calculate'></p>
            <h2 id='rulesText'>Rules</h2>
            <ol>
                <li id='rule1'></li>
                <li id='rule2'></li>
                <li id='rule3'></li>
            </ol>
            <h2 id='rubricsText'>Rubrics</h2>
            <p id='rubricsExpl'></p>
            <input id='scoringButton' type='button' onClick='showRubrics("Scoring")' value='Show Scoring Rubrics'>
            <input id='survivalButton' type='button' onClick='showRubrics("Survival")' value='Show Survival Rubrics'>
            <div id='scoringRubrics'>
                <p><strong id='scoringNotes'></strong></p>
                <ul>
					<li id='WRpage'></li>
                    <li id='newWR'></li>
                    <li id='fictionalWR'></li>
                    <li id='WRdefinition'></li>
                    <li id='mofSeparate'></li>
                    <li id='dsSeparate'></li>
                </ul>
				<table class='center'>
		        	<thead>
						<tr>
							<td colspan='3'><strong id='scoring1'></strong><br><span id='scoreFormula'></span></td>
						</tr>
					</thead>
		        	<tbody id='scoringTable'><tr><td></td><td></td><td></td></tr></tbody>
		        </table>
				<br>
				<strong id='fictionalWRtitle'></strong>
				<p id='fictionalWRdesc'></p>
				<table class='center'>
					<tbody id='fictionalWRtable'></tbody>
				</table>
				<br>
				<strong id='WRdefinitionTitle'></strong>
				<p id='WRdefinitionDesc'></p>
				<table class='center'>
					<tbody id='WRdefinitionTable'></tbody>
				</table>
                <br>
                <strong id='mountainOfFaith'></strong>
                <p id='mountainOfFaithDesc'></p>
                <table class='center'>
                    <tbody id='mofTable'></tbody>
                </table>
                <br>
                <strong id='doubleSpoiler'></strong>
                <p id='doubleSpoilerDesc'></p>
                <table class='center'>
                    <tbody id='dsTable'></tbody>
                </table>
                <br>
                <p><strong><a id='backToTop0' href='#nav'></a></strong></p>
			</div>
			<div id='survivalRubrics'>
                <p><strong id='survivalNotes'></strong></p>
                <ul>
                    <li id='maingame'></li>
                    <li id='phantasmagoriaSeparate'></li>
                    <li id='inLS'></li>
                    <li id='hsifsReleases'></li>
                </ul>
		        <table class='center'>
		        	<thead>
						<tr>
							<td colspan='6'><strong id='survival1'></strong><br><span id='survFormula'></span></td>
						</tr>
					</thead>
		        	<tbody id='survivalTable'><tr><td></td><td></td><td></td><td></td><td></td><td></td></tr></tbody>
		        </table>
				<br>
                <strong id='phantasmagoria'></strong>
                <p id='phantasmagoriaDesc'></p>
                <table class='center'>
                    <thead><tr><td id='pofvFormula'></td></tr></thead>
                    <tbody id='phantasmagoriaTable'><tr><td></td></tr></tbody>
                </table>
                <br>
                <strong id='shottypeMultipliers'></strong>
                <p id='shotMultDesc'></p>
                <table class='center'>
                    <tbody id='shottypeMultipliersTable'></tbody>
                </table>
                <br>
                <p><strong><a id='backToTop1' href='#nav'></a></strong></p>
            </div>
            <h2 id='ackText'>Acknowledgements</h2>
            <table id='acks' class='noborders'>
                <tbody>
					<tr class='noborders'>
						<td id='credit' class='noborders'></td>
                    <tr class='noborders'>
                        <td id='jptlcredit' class='noborders'></td>
                    </tr>
                    <tr class='noborders'>
                        <td id='cntlcredit' class='noborders'></td>
                    </tr>
                </tbody>
            </table>
		</div>
		<!-- Default Statcounter code for Maribel Hearn's Web Portal
		http://maribelhearn.com -->
		<script>
		var sc_project=12065202;
		var sc_invisible=1;
		var sc_security="a3a19e1b";
		</script>
		<script
		src="https://www.statcounter.com/counter/counter.js"
		async></script>
		<noscript><div class="statcounter"><a title="Web Analytics"
		href="https://statcounter.com/" target="_blank"><img
		class="statcounter"
		src="https://c.statcounter.com/12065202/0/a3a19e1b/1/"
		alt="Web Analytics"></a></div></noscript>
		<!-- End of Statcounter Code -->
	</body>

</html>