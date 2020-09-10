-- DROP FUNCTION public."fnSwapValuesForText"(text);
CREATE OR REPLACE FUNCTION public."fnSwapValuesForText"(
	varstringtoconvert text,
    vardelimiter text)
    RETURNS character varying
    LANGUAGE 'plpgsql'

    COST 100
    VOLATILE 
AS $BODY$DECLARE varOldString varchar(4000) := varStringToConvert;
DECLARE varNewString varchar(4000) := '';
DECLARE varCurrentValue text;
DECLARE varCurrentText text;

BEGIN

    -- if the input string is NULL or empty, return an emptry string
	if COALESCE(varStringToConvert,'') = '' then
	    RETURN '';
	end if;
	
    -- Prep input string by removing the preceding "|" characters (note the trailing "|" is needed for loop processing)
	varOldString := RIGHT(varOldString, LENGTH(varOldString)-1);
--	RAISE NOTICE 'varOldString (%)', varOldString;

	loop
		varCurrentValue := LEFT(varOldString, STRPOS(varOldString, '|')-1);
		varCurrentText := '';
--        RAISE NOTICE 'varCurrentValue (%)', varCurrentValue;

        SELECT "FieldOfStudyCategory"
		INTO   varCurrentText
		FROM   public."tblFieldOfStudyCategories"
		WHERE  "FieldOfStudyCategoryID" = varCurrentValue::integer;

--        RAISE NOTICE 'varCurrentText (%)', varCurrentText;

        varNewString := varNewString || varCurrentText || varDelimiter;
--        RAISE NOTICE 'varNewString (%)', varNewString;
		
        varOldString := RIGHT(varOldString, LENGTH(varOldString)-STRPOS(varOldString, '|'));
--        RAISE NOTICE 'varOldString (%)', varOldString;

        if LENGTH(varOldString) = 0 then
		    exit;
		end if;

	end loop;

    -- Remove any trailing delimiters
	if RIGHT(varNewString, LENGTH(varDelimiter)) = varDelimiter then
	    varNewString := LEFT(varNewString, LENGTH(varNewString) - LENGTH(varDelimiter));
	end if;

    RETURN varNewString;
	
END;
$BODY$;

ALTER FUNCTION public."fnSwapValuesForText"(text, text)
    OWNER TO futureof_jlqf;
